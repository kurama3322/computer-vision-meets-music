import type { Howl } from 'howler'

export type HandLandmark = {
  x: number
  y: number
  z: number
}

export type HandTrackingResult = {
  landmarks: HandLandmark[][]
  worldLandmarks: HandLandmark[][]
  handedness: Array<{ categoryName: string; score: number }[]>
}

export type FingerBends = {
  index: boolean
  middle: boolean
  ring: boolean
  pinky: boolean
}

export type FingerTrackMapping = Record<
  keyof FingerBends,
  {
    track: string
    text: string
  }
>

export type TrackConfig = {
  name: string
  src: string
  howl: Howl | null
}
