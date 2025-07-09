import { useEffect, useState } from 'react'
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
import {
  MIN_HAND_DETECTION_CONFIDENCE,
  MIN_HAND_PRESENCE_CONFIDENCE,
  MIN_TRACKING_CONFIDENCE,
} from '~/constants/hands'

export function useHandLandmarker() {
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initialiseHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
        )

        const createLandmarker = (delegate: 'GPU' | 'CPU') =>
          HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              delegate,
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: MIN_HAND_DETECTION_CONFIDENCE,
            minHandPresenceConfidence: MIN_HAND_PRESENCE_CONFIDENCE,
            minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
          })

        let landmarker: HandLandmarker
        try {
          landmarker = await createLandmarker('GPU')
        } catch {
          landmarker = await createLandmarker('CPU')
        }

        setHandLandmarker(landmarker)
        setIsLoading(false)
      } catch (err) {
        setError(
          `failed to initialise hand tracking: "${err instanceof Error ? err.message.toLowerCase() : 'unknown error'}"`,
        )
        setIsLoading(false)
      }
    }

    void initialiseHandLandmarker()
  }, [])

  return {
    handLandmarker,
    isLoading,
    error,
  }
}
