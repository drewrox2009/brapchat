export const rideVisibilityValues = [
  'OPEN',
  'FRIENDS',
  'PREVIOUS_RIDERS',
  'REQUEST_TO_JOIN',
  'PRIVATE',
] as const;

export type RideVisibility = (typeof rideVisibilityValues)[number];
