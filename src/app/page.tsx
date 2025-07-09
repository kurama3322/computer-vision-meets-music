'use client'

import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Error } from '~/components/error'
import { HandSkeleton } from '~/components/hand-skeleton'
import { Loading } from '~/components/loading'
import { MusicStatus } from '~/components/music-status'
import { StartScreen } from '~/components/start-screen'
import { MAX_VOLUME } from '~/constants/volume'
import { useCamera } from '~/hooks/useCamera'
import { useHandDetection } from '~/hooks/useHandDetection/useHandDetection'
import { useHandLandmarker } from '~/hooks/useHandLandmarker'
import { useMusicControl } from '~/hooks/useMusicControl'
import type { FingerBends } from '~/types'

export default function Page() {
  const [fingerBends, setFingerBends] = useState<FingerBends | undefined>()
  const [volume, setVolume] = useState<number | null>(MAX_VOLUME)
  const [hasStarted, setHasStarted] = useState<boolean>(!isMobile)

  const { videoRef, isVideoReady, error: cameraError } = useCamera()
  const { handLandmarker, isLoading, error: landmarkerError } = useHandLandmarker()
  const { controlMusic, controlVolume, hasMusicStarted, unlockAudio } =
    useMusicControl(hasStarted)

  const handleFingerBends = (inputFingerBends: FingerBends) => {
    setFingerBends(inputFingerBends)
    controlMusic(inputFingerBends)
  }

  const handleVolumeChange = (inputVolume: number | null) => {
    setVolume(inputVolume)
    controlVolume(inputVolume)
  }

  const handTrackingResult = useHandDetection(
    handLandmarker,
    videoRef,
    isVideoReady && hasStarted,
    handleFingerBends,
    handleVolumeChange,
  )

  const error = cameraError || landmarkerError
  if (isLoading) return <Loading />
  if (error) return <Error error={error} />

  if (!hasStarted) {
    return (
      <StartScreen
        onClick={async () => {
          if (isMobile) await unlockAudio()
          setHasStarted(true)
        }}
      />
    )
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        controls={false}
        preload="metadata"
        className="absolute inset-0 h-full w-full scale-x-[-1] transform object-cover grayscale"
      />
      {handTrackingResult && (
        <HandSkeleton
          handTrackingResult={handTrackingResult}
          videoElement={videoRef.current}
          volume={volume}
        />
      )}
      <MusicStatus hasMusicStarted={hasMusicStarted} fingerBends={fingerBends} />
    </main>
  )
}
