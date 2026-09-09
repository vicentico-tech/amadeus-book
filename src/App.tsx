import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">Hola, React + Tailwind</h1>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-lg bg-purple-600 px-4 py-2 font-medium hover:bg-purple-500"
      >
        Count is {count}
      </button>
    </div>
  )
}

export default App
