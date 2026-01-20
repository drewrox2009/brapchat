import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import { createClient, Session, User } from '@supabase/supabase-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Room, RoomEvent } from 'livekit-client';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

type AuthMode = 'phone' | 'email';

type PublicRide = {
  id: string;
  code: string;
  createdAt: string;
  host?: {
    screenName?: string | null;
  } | null;
  members?: { id: string }[];
};

type FallbackRide = {
  id: string;
  name: string;
  host: string;
  riders: number;
  time: string;
};

const fallbackRides: FallbackRide[] = [
  {
    id: 'ride-1',
    name: 'Pacific Loop',
    host: 'Maya',
    riders: 6,
    time: 'Live now',
  },
  {
    id: 'ride-2',
    name: 'Harbor Run',
    host: 'Andre',
    riders: 4,
    time: 'Started 12 min ago',
  },
];

const formatRideCount = (ride: PublicRide | FallbackRide) => {
  if ('riders' in ride) {
    return `${ride.riders} riders · ${ride.time}`;
  }
  return `${ride.members?.length ?? 0} riders · Live now`;
};

const formatRideTitle = (ride: PublicRide | FallbackRide) =>
  'name' in ride ? ride.name : ride.code;

const formatRideHost = (ride: PublicRide | FallbackRide) => {
  if ('host' in ride && typeof ride.host === 'string') {
    return ride.host;
  }

  if (ride.host && typeof ride.host === 'object') {
    return ride.host.screenName ?? 'Unknown';
  }

  return 'Unknown';
};

export const App = () => {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
  });
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [authValue, setAuthValue] = useState('');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [screenName, setScreenName] = useState('');
  const [screenNameMessage, setScreenNameMessage] = useState('');
  const [screenNameLoading, setScreenNameLoading] = useState(false);
  const [publicRides, setPublicRides] = useState<PublicRide[]>([]);
  const [rideError, setRideError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [rideCode, setRideCode] = useState('');
  const [rideLoading, setRideLoading] = useState(false);
  const [rideMessage, setRideMessage] = useState('');
  const [activeRideCode, setActiveRideCode] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState('Not connected');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );

  const isSupabaseConfigured = useMemo(
    () => Boolean(supabaseUrl && supabaseAnonKey),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(data.session);
        setAuthUser(data.session?.user ?? null);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (isMounted) {
          setSession(nextSession);
          setAuthUser(nextSession?.user ?? null);
        }
      }
    );

    const handleDeepLink = (url: string | null) => {
      if (!url) {
        return;
      }
      const match = url.match(/\/ride\/([A-Za-z0-9]+)/i);
      if (match?.[1]) {
        setRideCode(match[1]);
        setRideMessage('Invite detected. Tap join to enter the ride.');
      }
    };

    Linking.getInitialURL().then(handleDeepLink);
    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPublicRides = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/rides/public`);
        if (!response.ok) {
          throw new Error('Unable to load rides');
        }
        const data = (await response.json()) as PublicRide[];
        if (isMounted) {
          setPublicRides(data);
          setRideError(null);
        }
      } catch (error) {
        if (isMounted) {
          setRideError('Connect to the API to see live rides.');
        }
      }
    };

    loadPublicRides();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status);
      if (status === 'granted') {
        locationSubscription.current =
          await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 5,
            },
            async (location: Location.LocationObject) => {
              setCurrentLocation(location);
              if (activeRideCode && session?.access_token) {
                try {
                  await fetch(`${apiBaseUrl}/rides/position`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      code: activeRideCode,
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      speed: location.coords.speed ?? undefined,
                      heading: location.coords.heading ?? undefined,
                      accuracy: location.coords.accuracy ?? undefined,
                    }),
                  });
                } catch (error) {
                  setRideMessage('Unable to send location updates.');
                }
              }
            }
          );
      }
    };

    requestLocation();

    return () => {
      locationSubscription.current?.remove();
    };
  }, [activeRideCode, session?.access_token]);

  const handleSendCode = async () => {
    if (!authValue) {
      setAuthMessage('Enter your phone or email to continue.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (authMode === 'phone') {
        const { error } = await supabase.auth.signInWithOtp({
          phone: authValue,
        });
        if (error) {
          throw error;
        }
        setAuthMessage('Code sent via SMS.');
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: authValue,
        });
        if (error) {
          throw error;
        }
        setAuthMessage('Magic link sent.');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send code.';
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setAuthMessage('Enter the code you received.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage('');

    try {
      const verificationPayload =
        authMode === 'phone'
          ? { phone: authValue, token: otp, type: 'sms' as const }
          : { email: authValue, token: otp, type: 'email' as const };
      const { error } = await supabase.auth.verifyOtp(verificationPayload);
      if (error) {
        throw error;
      }
      setAuthMessage('Signed in.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify code.';
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetScreenName = async () => {
    if (!screenName.trim()) {
      setScreenNameMessage('Enter a screen name to continue.');
      return;
    }

    if (!session?.access_token) {
      setScreenNameMessage('Sign in before setting a screen name.');
      return;
    }

    setScreenNameLoading(true);
    setScreenNameMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/screen-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ screenName: screenName.trim() }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message ?? 'Unable to set screen name');
      }

      setScreenNameMessage('Screen name saved.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to set screen name.';
      setScreenNameMessage(message);
    } finally {
      setScreenNameLoading(false);
    }
  };

  const handleCreateRide = async () => {
    if (!rideCode) {
      setRideMessage('Enter a ride code to create a room.');
      return;
    }

    if (!session?.access_token) {
      setRideMessage('Sign in to create a ride.');
      return;
    }

    setRideLoading(true);
    setRideMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: rideCode, visibility: 'OPEN' }),
      });

      if (!response.ok) {
        throw new Error('Unable to create ride');
      }

      setActiveRideCode(rideCode.trim().toUpperCase());
      setRideMessage('Ride created.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create ride.';
      setRideMessage(message);
    } finally {
      setRideLoading(false);
    }
  };

  const handleJoinVoice = async () => {
    if (!activeRideCode) {
      setRideMessage('Join a ride before connecting voice.');
      return;
    }

    if (!session?.access_token) {
      setRideMessage('Sign in to connect voice.');
      return;
    }

    setVoiceLoading(true);
    setVoiceStatus('Requesting token...');

    try {
      const response = await fetch(`${apiBaseUrl}/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          rideCode: activeRideCode,
          participantName:
            authUser?.email ?? authUser?.phone ?? 'brapchat-rider',
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to get voice token');
      }

      const data = (await response.json()) as { token: string };
      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => {
        setVoiceStatus('Disconnected');
      });

      const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL ?? '';
      if (!livekitUrl) {
        throw new Error('Missing LiveKit URL');
      }

      await room.connect(`wss://${livekitUrl}`, data.token);

      setVoiceStatus('Connected');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to join voice.';
      setVoiceStatus(message);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleLeaveVoice = async () => {
    await roomRef.current?.disconnect();
    roomRef.current = null;
    setVoiceStatus('Disconnected');
  };

  const handleJoinRide = async () => {
    if (!rideCode) {
      setRideMessage('Enter a ride code to join.');
      return;
    }

    if (!session?.access_token) {
      setRideMessage('Sign in to join a ride.');
      return;
    }

    setRideLoading(true);
    setRideMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/rides/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: rideCode }),
      });

      if (!response.ok) {
        throw new Error('Unable to join ride');
      }

      setActiveRideCode(rideCode.trim().toUpperCase());
      setRideMessage('Joined ride.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to join ride.';
      setRideMessage(message);
    } finally {
      setRideLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[colors.surface, colors.surfaceAlt]}
        style={styles.background}
      >
        <View style={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.brand}>BrapChat</Text>
            <Text style={styles.tagline}>Group ride voice, no brand lock-in.</Text>
          </View>

          {!isSupabaseConfigured ? (
            <View style={styles.warningCard}>
              <Text style={styles.sectionTitle}>Supabase not configured</Text>
              <Text style={styles.sectionSubtitle}>
                Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
              </Text>
            </View>
          ) : null}

          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Quick ride</Text>
            <Text style={styles.sectionSubtitle}>
              Open-mic voice, live positions, no headset drama.
            </Text>
            {activeRideCode ? (
              <Text style={styles.noticeText}>
                Active ride: {activeRideCode}
              </Text>
            ) : (
              <Text style={styles.noticeText}>No active ride yet.</Text>
            )}
            <TextInput
              placeholder="Ride code"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.rideCodeInput]}
              value={rideCode}
              onChangeText={setRideCode}
              autoCapitalize="characters"
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateRide}
              >
                {rideLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create ride</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleJoinRide}
              >
                <Text style={styles.secondaryButtonText}>Join ride</Text>
              </TouchableOpacity>
            </View>
            {rideMessage ? (
              <Text style={styles.noticeText}>{rideMessage}</Text>
            ) : null}
            <View style={styles.noticeRow}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeText}>
                Guests can listen immediately. Map unlocks with an account.
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sign in</Text>
            <Text style={styles.sectionSubtitle}>
              Phone or email, no passwords needed.
            </Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={
                  authMode === 'phone'
                    ? styles.toggleActive
                    : styles.toggleIdle
                }
                onPress={() => setAuthMode('phone')}
              >
                <Text
                  style={
                    authMode === 'phone'
                      ? styles.toggleActiveText
                      : styles.toggleIdleText
                  }
                >
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  authMode === 'email'
                    ? styles.toggleActive
                    : styles.toggleIdle
                }
                onPress={() => setAuthMode('email')}
              >
                <Text
                  style={
                    authMode === 'email'
                      ? styles.toggleActiveText
                      : styles.toggleIdleText
                  }
                >
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputStack}>
              <TextInput
                placeholder={
                  authMode === 'phone' ? 'Phone number' : 'Email address'
                }
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType={authMode === 'phone' ? 'phone-pad' : 'email-address'}
                value={authValue}
                onChangeText={setAuthValue}
              />
              {authMode === 'phone' ? (
                <TextInput
                  placeholder="SMS code"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                />
              ) : null}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSendCode}
              >
                {authLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {authMode === 'phone' ? 'Send code' : 'Send link'}
                  </Text>
                )}
              </TouchableOpacity>
              {authMode === 'phone' ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleVerifyOtp}
                >
                  <Text style={styles.secondaryButtonText}>Verify code</Text>
                </TouchableOpacity>
              ) : null}
              {authMessage ? (
                <Text style={styles.noticeText}>{authMessage}</Text>
              ) : null}
              {session ? (
                <Text style={styles.noticeText}>
                  Signed in as {authUser?.email ?? authUser?.phone ?? 'Rider'}.
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Screen name</Text>
            <Text style={styles.sectionSubtitle}>
              Set a unique handle before joining rides.
            </Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.inputStack}>
              <TextInput
                placeholder="Screen name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={screenName}
                onChangeText={setScreenName}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSetScreenName}
              >
                {screenNameLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save screen name</Text>
                )}
              </TouchableOpacity>
              {screenNameMessage ? (
                <Text style={styles.noticeText}>{screenNameMessage}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voice</Text>
            <Text style={styles.sectionSubtitle}>
              Join the LiveKit room for this ride.
            </Text>
          </View>

          <View style={styles.authCard}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleJoinVoice}
              >
                {voiceLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Join voice</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleLeaveVoice}
              >
                <Text style={styles.secondaryButtonText}>Leave voice</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.noticeText}>Status: {voiceStatus}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Who’s riding</Text>
            <Text style={styles.sectionSubtitle}>Public rides near you.</Text>
          </View>

          {rideError ? <Text style={styles.noticeText}>{rideError}</Text> : null}

          <View style={styles.rideList}>
            {(publicRides.length > 0 ? publicRides : fallbackRides).map(
              (ride) => (
                <View key={ride.id} style={styles.rideCard}>
                  <View>
                    <Text style={styles.rideName}>{formatRideTitle(ride)}</Text>
                    <Text style={styles.rideMeta}>
                      Host: {formatRideHost(ride)}
                    </Text>
                    <Text style={styles.rideMeta}>{formatRideCount(ride)}</Text>
                  </View>
                  <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Ask to join</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Live location</Text>
            <Text style={styles.sectionSubtitle}>
              Your current position updates every 5 seconds.
            </Text>
            <View style={styles.mapWrapper}>
              {currentLocation ? (
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: currentLocation.coords.latitude,
                      longitude: currentLocation.coords.longitude,
                    }}
                    title="You"
                  />
                </MapView>
              ) : (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.sectionSubtitle}>
                    Location {locationStatus || 'pending'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Hands-free defaults</Text>
            <Text style={styles.sectionSubtitle}>Large touch targets, simple flows.</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mic</Text>
                <Text style={styles.infoValue}>Open-mic</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Room size</Text>
                <Text style={styles.infoValue}>Up to 10</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Visibility</Text>
                <Text style={styles.infoValue}>Private by default</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {locationStatus === 'granted'
                    ? 'Enabled'
                    : locationStatus || 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const colors = {
  surface: '#f8f7f4',
  surfaceAlt: '#edf0f3',
  card: '#ffffff',
  ink: '#141516',
  muted: '#52565c',
  line: '#d7dce2',
  accent: '#0f3d3e',
  accentSoft: '#dfe9e6',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  brand: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 32,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 6,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: colors.muted,
  },
  warningCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0b429',
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    color: colors.ink,
  },
  sectionSubtitle: {
    marginTop: 6,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  rideCodeInput: {
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.accentSoft,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: colors.accent,
  },
  noticeRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  noticeText: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  authCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.line,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleActive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  toggleIdle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  toggleActiveText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#ffffff',
  },
  toggleIdleText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.muted,
  },
  inputStack: {
    marginTop: 16,
    gap: 12,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: colors.ink,
  },
  rideList: {
    gap: 12,
  },
  rideCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rideName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
  rideMeta: {
    marginTop: 4,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: colors.muted,
  },
  joinButton: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  joinButtonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: colors.accent,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.line,
  },
  mapWrapper: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceAlt,
  },
  map: {
    width: '100%',
    height: 220,
  },
  mapPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGrid: {
    marginTop: 16,
    gap: 12,
  },
  infoItem: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
  },
  infoLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  infoValue: {
    marginTop: 6,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: colors.ink,
  },
});

export default App;
