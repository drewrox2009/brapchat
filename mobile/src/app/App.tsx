import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

const fallbackRides = [
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

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const App = () => {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
  });
  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [publicRides, setPublicRides] = useState<PublicRide[]>([]);
  const [rideError, setRideError] = useState<string | null>(null);

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

          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Quick ride</Text>
            <Text style={styles.sectionSubtitle}>
              Open-mic voice, live positions, no headset drama.
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Create ride</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Join ride</Text>
              </TouchableOpacity>
            </View>
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
                  authMode === 'phone'
                    ? 'Phone number'
                    : 'Email address'
                }
                placeholderTextColor={colors.muted}
                style={styles.input}
                keyboardType={authMode === 'phone' ? 'phone-pad' : 'email-address'}
              />
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Send code</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Who’s riding</Text>
            <Text style={styles.sectionSubtitle}>Public rides near you.</Text>
          </View>

          <View style={styles.rideList}>
            {(publicRides.length > 0 ? publicRides : fallbackRides).map(
              (ride) => {
                const isFallback = 'name' in ride;
                const title = isFallback ? ride.name : ride.code;
                const hostName = isFallback
                  ? ride.host
                  : ride.host?.screenName ?? 'Unknown';
                const riderLine = isFallback
                  ? `${ride.riders} riders · ${ride.time}`
                  : `${ride.members?.length ?? 0} riders · Live now`;

                return (
                  <View key={ride.id} style={styles.rideCard}>
                    <View>
                      <Text style={styles.rideName}>{title}</Text>
                      <Text style={styles.rideMeta}>Host: {hostName}</Text>
                      <Text style={styles.rideMeta}>{riderLine}</Text>
                    </View>
                    <TouchableOpacity style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>Ask to join</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
            )}
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
