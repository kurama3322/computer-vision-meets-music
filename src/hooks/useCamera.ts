import { useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)

  // initialise camera
  useEffect(() => {
    let currentStream: MediaStream | null = null

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('camera access is not supported in this browser')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        })

        currentStream = stream
        setStream(stream)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'unknown error'
        setError(`failed to access camera: "${errorMessage.toLowerCase()}"`)
      }
    }

    void initCamera()

    return () => {
      currentStream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  // handle stream assignment with retries and backup
  useEffect(() => {
    if (!stream) return

    const assignStreamToVideo = async () => {
      const video = videoRef.current
      if (!video || !stream) return false

      try {
        video.srcObject = stream
        video.load()

        return new Promise<boolean>((resolve) => {
          const cleanup = () => {
            video.removeEventListener('loadedmetadata', onReady)
            video.removeEventListener('canplay', onReady)
          }

          const onReady = () => {
            cleanup()
            void video.play().catch((playError) => {
              console.warn('video play failed:', playError)
            })
            setIsVideoReady(true)
            resolve(true)
          }

          video.addEventListener('loadedmetadata', onReady)
          video.addEventListener('canplay', onReady)

          if (video.readyState >= 1) onReady()

          setTimeout(() => {
            cleanup()
            resolve(false)
          }, 3000)
        })
      } catch {
        return false
      }
    }

    const assignWithRetries = async () => {
      // wait for video element
      while (!videoRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // try assignment with retries
      for (let i = 0; i < 3; i++) {
        if (await assignStreamToVideo()) return
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // backup - direct assignment
      const video = videoRef.current
      if (video && !video.srcObject) {
        video.srcObject = stream
        video.load()
        void video.play().catch((playError) => {
          console.warn('backup video play failed:', playError)
        })
        setIsVideoReady(true)
      }
    }

    void assignWithRetries()
  }, [stream])

  return {
    videoRef,
    isVideoReady,
    error,
  }
}
