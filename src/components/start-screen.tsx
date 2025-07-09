import type React from 'react'

export function StartScreen({ onClick }: React.ComponentProps<'div'>) {
  return (
    <div
      onClick={onClick}
      className="flex min-h-screen cursor-pointer items-center justify-center bg-black"
    >
      <p className="text-lg text-white">are you ready?</p>
    </div>
  )
}
