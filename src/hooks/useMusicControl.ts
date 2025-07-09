import { useCallback, useEffect, useRef, useState } from 'react'
import { Howl, Howler } from 'howler'
import { isMobile } from 'react-device-detect'
import { MAX_VOLUME, MIN_VOLUME, MOBILE_VOLUME } from '~/constants/volume'
import type { FingerBends, TrackConfig } from '~/types'

export function useMusicControl(hasStarted = true) {
  const [isInitialised, setIsInitialised] = useState<boolean>(false)
  const [hasMusicStarted, setHasMusicStarted] = useState<boolean>(false)
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false)
  const tracksRef = useRef<Record<string, TrackConfig>>({
    index: { name: 'piano', src: '/piano.mp3', howl: null },
    middle: { name: 'drums', src: '/drums.mp3', howl: null },
    ring: { name: 'bass', src: '/bass.mp3', howl: null },
    pinky: { name: 'brass', src: '/brass.mp3', howl: null },
  })

  // unlock audio context for mobile devices
  const unlockAudio = useCallback(async () => {
    if (isAudioUnlocked) return true

    try {
      // create and play a silent sound to unlock audio
      const unlock = new Howl({ src: [''], volume: 0 })
      unlock.play()
      unlock.unload()
      setIsAudioUnlocked(true)
      return true
    } catch {
      return false
    }
  }, [isAudioUnlocked])

  // initialise audio tracks
  useEffect(() => {
    if (!hasStarted) return

    const initialiseTracks = async () => {
      const currentTracks = tracksRef.current

      await unlockAudio()

      Howler.autoUnlock = true

      Object.keys(currentTracks).forEach((finger) => {
        const track = currentTracks[finger]!
        track.howl = new Howl({
          src: [track.src],
          loop: true,
          preload: true,
          html5: true,
        })
      })

      setIsInitialised(true)
    }

    void initialiseTracks()

    return () => {
      const currentTracks = tracksRef.current
      Object.values(currentTracks).forEach((track) => {
        track.howl?.unload()
      })
    }
  }, [hasStarted, isAudioUnlocked, unlockAudio])

  // control music based on finger bends
  const controlMusic = (fingerBends: FingerBends) => {
    if (!isInitialised || !hasStarted) return

    const currentTracks = tracksRef.current
    const straightFingers = Object.entries(fingerBends).filter(([_, isBent]) => !isBent)

    // start music once when we first detect any straight finger
    if (straightFingers.length > 0 && !hasMusicStarted) {
      setHasMusicStarted(true)
      Object.values(currentTracks).forEach((track) => {
        if (track.howl && !track.howl.playing()) {
          track.howl.play()
        }
      })
    }

    // if music has started, only control mute states based on finger bends
    if (hasMusicStarted) {
      Object.entries(fingerBends).forEach(([finger, isBent]) => {
        currentTracks[finger]!.howl?.mute(Boolean(isBent))
      })
    }
  }

  const controlVolume = (inputVolume: number | null) => {
    if (!isInitialised || !hasStarted || inputVolume === null) return

    // clamp to volume range
    const newVolume = Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, inputVolume))

    Howler.volume(isMobile ? MOBILE_VOLUME : newVolume)
  }

  return {
    controlMusic,
    controlVolume,
    hasMusicStarted,
    unlockAudio,
    isAudioUnlocked,
  }
}
