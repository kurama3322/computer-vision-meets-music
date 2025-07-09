'use client'

import { useEffect, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import { HAND_CONNECTIONS } from '~/constants/hands'
import { MAX_VOLUME } from '~/constants/volume'
import { type HandTrackingResult } from '~/types'

export function HandSkeleton({
  handTrackingResult,
  videoElement,
  volume,
}: {
  handTrackingResult: HandTrackingResult
  videoElement: HTMLVideoElement | null
  volume: number | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoElement) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    updateCanvasSize()

    window.addEventListener('resize', updateCanvasSize)
    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [videoElement])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoElement) return

    if (!contextRef.current) {
      contextRef.current = canvas.getContext('2d')
    }
    const ctx = contextRef.current
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    handTrackingResult.landmarks.forEach((landmarks, handIndex) => {
      // bones
      ctx.strokeStyle = '#489146'
      ctx.lineWidth = 2
      HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
        const start = landmarks[startIndex]
        const end = landmarks[endIndex]

        if (start && end) {
          // mirror the `x` coordinates to match the mirrored video
          const startX = (1 - start.x) * canvas.width
          const startY = start.y * canvas.height
          const endX = (1 - end.x) * canvas.width
          const endY = end.y * canvas.height

          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      })

      // joints
      ctx.fillStyle = '#ffffff'
      landmarks.forEach((landmark) => {
        // mirror the `x` coordinate to match the mirrored video
        const x = (1 - landmark.x) * canvas.width
        const y = landmark.y * canvas.height

        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fill()
      })

      // volume line and text
      if (!isMobile && handIndex === 1 && volume !== null) {
        const thumbTip = landmarks[4]
        const indexTip = landmarks[8]

        if (thumbTip && indexTip) {
          // mirror the coordinates to match the mirrored video
          const thumbX = (1 - thumbTip.x) * canvas.width
          const thumbY = thumbTip.y * canvas.height
          const indexX = (1 - indexTip.x) * canvas.width
          const indexY = indexTip.y * canvas.height

          const colour = 'rgb(224, 31, 31)'

          ctx.strokeStyle = colour
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(thumbX, thumbY)
          ctx.lineTo(indexX, indexY)
          ctx.stroke()

          const midX = (thumbX + indexX) / 2
          const midY = (thumbY + indexY) / 2

          const volumeText = `volume ${((volume * 100) / MAX_VOLUME).toFixed(0)}%`

          const textMetrics = ctx.measureText(volumeText)
          const textWidth = textMetrics.width
          const textHeight = 16

          ctx.fillStyle = colour
          ctx.fillRect(
            midX - textWidth / 2 - 10,
            midY - textHeight / 2 - 6,
            textWidth + 20,
            textHeight + 10,
          )

          ctx.fillStyle = '#ffffff'
          ctx.font = '16px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(volumeText, midX, midY)
        }
      }
    })
  }, [handTrackingResult, videoElement, volume])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
    />
  )
}
