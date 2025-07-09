import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { HandLandmarker } from '@mediapipe/tasks-vision'
import { SMOOTHING_FACTOR } from '~/constants/hands'
import { MAX_VOLUME } from '~/constants/volume'
import { analyseFingerBends } from '~/hooks/useHandDetection/analyseFingerBends'
import { calculateVolume } from '~/hooks/useHandDetection/calculateVolume'
import type { FingerBends, HandLandmark, HandTrackingResult } from '~/types'

export function useHandDetection(
  handLandmarker: HandLandmarker | null,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isVideoReady: boolean,
  handleFingerBends: (fingerBends: FingerBends) => void,
  handleVolumeChange: (volume: number | null) => void,
) {
  const [handTrackingResult, setHandTrackingResult] = useState<HandTrackingResult | null>(
    null,
  )
  const animationFrameRef = useRef<number | null>(null)
  const smoothedLandmarksRef = useRef<HandLandmark[][]>([])
  const lastFingerBendsRef = useRef<FingerBends | null>(null)
  const fingerBendsCallbackRef = useRef(handleFingerBends)
  const volumeCallbackRef = useRef(handleVolumeChange)
  fingerBendsCallbackRef.current = handleFingerBends
  volumeCallbackRef.current = handleVolumeChange

  const updateFingerBends = (fingerBends: FingerBends) => {
    const lastBends = lastFingerBendsRef.current

    // only update if finger bends have actually changed
    if (
      !lastBends ||
      lastBends.index !== fingerBends.index ||
      lastBends.middle !== fingerBends.middle ||
      lastBends.ring !== fingerBends.ring ||
      lastBends.pinky !== fingerBends.pinky
    ) {
      lastFingerBendsRef.current = fingerBends
      fingerBendsCallbackRef.current?.(fingerBends)
    }
  }

  const updateVolume = (volume: number | null) => {
    volumeCallbackRef.current?.(volume)
  }

  useEffect(() => {
    if (!handLandmarker || !videoRef.current || !isVideoReady) return

    const detectHands = () => {
      const videoElement = videoRef.current
      if (videoElement && videoElement.readyState >= 2) {
        try {
          const results = handLandmarker.detectForVideo(videoElement, performance.now())

          if (results.landmarks.length) {
            const smoothedLandmarks = results.landmarks.map(
              (handLandmarks, handIndex) => {
                const prevHand = smoothedLandmarksRef.current[handIndex]
                if (!prevHand) {
                  smoothedLandmarksRef.current[handIndex] = [...handLandmarks]
                  return handLandmarks
                }

                return handLandmarks.map((landmark, i) => {
                  const prev = prevHand[i]
                  if (!prev) {
                    smoothedLandmarksRef.current[handIndex]![i] = landmark
                    return landmark
                  }

                  const smoothed = {
                    x: prev.x * SMOOTHING_FACTOR + landmark.x * (1 - SMOOTHING_FACTOR),
                    y: prev.y * SMOOTHING_FACTOR + landmark.y * (1 - SMOOTHING_FACTOR),
                    z: prev.z * SMOOTHING_FACTOR + landmark.z * (1 - SMOOTHING_FACTOR),
                  }
                  smoothedLandmarksRef.current[handIndex]![i] = smoothed
                  return smoothed
                })
              },
            )

            let firstHandDetected = false
            let secondHandDetected = false
            let volume: number | null = null

            smoothedLandmarks.forEach((handLandmarks, handIndex) => {
              if (handIndex === 0) {
                // process 1st hand for music control
                firstHandDetected = true
                const fingerBends = analyseFingerBends(handLandmarks)
                updateFingerBends(fingerBends)
              } else if (handIndex === 1) {
                // process 2nd hand for volume control
                secondHandDetected = true
                volume = calculateVolume(handLandmarks)
              }
            })

            // if no 1st hand detected, treat all fingers as bent
            if (!firstHandDetected) {
              updateFingerBends({
                index: true,
                middle: true,
                ring: true,
                pinky: true,
              })
            }

            // update volume (max volume if no 2nd hand detected)
            updateVolume(secondHandDetected ? volume : MAX_VOLUME)

            setHandTrackingResult({
              landmarks: smoothedLandmarks,
              worldLandmarks: results.worldLandmarks || [],
              handedness: results.handedness || [],
            })
          } else {
            setHandTrackingResult(null)
            // no hands detected - treat all fingers as bent
            updateFingerBends({
              index: true,
              middle: true,
              ring: true,
              pinky: true,
            })
            updateVolume(MAX_VOLUME)
          }
        } catch (error) {
          console.warn('hand detection error:', error)
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectHands)
    }

    detectHands()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handLandmarker, videoRef, isVideoReady])

  return handTrackingResult
}
