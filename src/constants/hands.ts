export const MIN_HAND_DETECTION_CONFIDENCE = 0.75
export const MIN_HAND_PRESENCE_CONFIDENCE = 0.75
export const MIN_TRACKING_CONFIDENCE = 0.3

export const SMOOTHING_FACTOR = 0.7

export const BEND_THRESHOLD_DEGREES = 100

// finger landmark indices (excluding thumb)
// [MCP, PIP, DIP, TIP]
export const FINGER_LANDMARKS = {
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
} as const

export const HAND_CONNECTIONS = [
  // thumb
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  // index finger
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  // middle finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  // ring finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  // pinky
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  // palm
  [5, 9],
  [9, 13],
  [13, 17],
] as const
