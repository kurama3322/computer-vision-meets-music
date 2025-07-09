export function Error({ error }: { error: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center text-white">
        <p className="mb-4 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="cursor-pointer rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
        >
          retry
        </button>
      </div>
    </div>
  )
}
