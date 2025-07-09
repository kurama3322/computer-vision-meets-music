import type { FingerBends, FingerTrackMapping } from '~/types'

export function MusicStatus({
  hasMusicStarted,
  fingerBends,
}: {
  hasMusicStarted: boolean
  fingerBends?: FingerBends
}) {
  const fingerTrackMapping: FingerTrackMapping = {
    index: { track: 'piano', text: 'index finger' },
    middle: { track: 'drums', text: 'middle finger' },
    ring: { track: 'bass', text: 'ring finger' },
    pinky: { track: 'brass', text: 'pinky' },
  }

  return (
    <div className="absolute top-4 left-4 z-10 rounded-lg bg-black/50 p-4 text-white backdrop-blur-sm">
      <div className="mb-3">
        <span
          className={`text-xl font-bold ${hasMusicStarted ? 'text-green-400' : 'text-yellow-400'}`}
        >
          {hasMusicStarted ? 'have fun' : 'raise your hands'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        {Object.entries(fingerTrackMapping).map(([finger, info]) => {
          const isBent = fingerBends?.[finger as keyof FingerBends] ?? true
          const isActive = hasMusicStarted && !isBent
          return (
            <div
              key={finger}
              className={`flex items-center space-x-2 rounded p-2 ${
                isActive
                  ? 'bg-green-600/30 text-green-200'
                  : 'bg-gray-600/30 text-gray-400'
              }`}
            >
              <span className="w-[17ch] font-medium"> {info.text} </span>
              <span>{info.track}</span>
              <span
                className={`ml-auto w-[10ch] text-right text-xs ${isActive ? 'text-green-300' : 'text-red-300'}`}
              >
                {isActive ? 'playing' : 'muted'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
