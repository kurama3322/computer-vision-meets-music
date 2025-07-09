import {
  MAX_FINGER_DISTANCE,
  MAX_VOLUME,
  MIN_FINGER_DISTANCE,
  MIN_VOLUME,
} from '~/constants/volume'
import type { HandLandmark } from '~/types'

export function calculateVolume(landmarks: HandLandmark[]) {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]

  if (!thumbTip || !indexTip) {
    return null
  }

  // calculate euclidean distance between thumb and index fingertips
  const dx = thumbTip.x - indexTip.x
  const dy = thumbTip.y - indexTip.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // clamp distance to expected range
  const clampedDistance = Math.max(
    MIN_FINGER_DISTANCE,
    Math.min(MAX_FINGER_DISTANCE, distance),
  )

  // linear mapping from distance to volume
  const normalisedDistance =
    (clampedDistance - MIN_FINGER_DISTANCE) / (MAX_FINGER_DISTANCE - MIN_FINGER_DISTANCE)
  const volume = MIN_VOLUME + normalisedDistance * (MAX_VOLUME - MIN_VOLUME)

  return Math.round(volume * 1000) / 1000
}
