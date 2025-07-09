import { BEND_THRESHOLD_DEGREES, FINGER_LANDMARKS } from '~/constants/hands'
import type { HandLandmark } from '~/types'

export function analyseFingerBends(landmarks: HandLandmark[]) {
  return {
    index: isFingerBent(landmarks, FINGER_LANDMARKS.index),
    middle: isFingerBent(landmarks, FINGER_LANDMARKS.middle),
    ring: isFingerBent(landmarks, FINGER_LANDMARKS.ring),
    pinky: isFingerBent(landmarks, FINGER_LANDMARKS.pinky),
  }
}

function isFingerBent(landmarks: HandLandmark[], fingerIndices: readonly number[]) {
  const [mcp, pip, dip, tip] = fingerIndices.map((i) => landmarks[i])

  if (!mcp || !pip || !dip || !tip) return false

  const pipAngle = calculateAngle(mcp, pip, dip)
  const dipAngle = calculateAngle(pip, dip, tip)

  // a finger is considered bent if either joint angle is below threshold
  // (straight finger would be close to 180 degrees)
  return pipAngle < BEND_THRESHOLD_DEGREES || dipAngle < BEND_THRESHOLD_DEGREES
}

// calculate angle between three points
function calculateAngle(p1: HandLandmark, p2: HandLandmark, p3: HandLandmark) {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }

  const dot = v1.x * v2.x + v1.y * v2.y
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

  const cosAngle = dot / (mag1 * mag2)
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)))

  // convert to degrees
  return (angle * 180) / Math.PI
}
