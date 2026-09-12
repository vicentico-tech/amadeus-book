import { useState } from 'react'

function App() {
  const swatches = [
    ["canvas", "bg-canvas"],
    ["app", "bg-app"],
    ["surface", "bg-surface"],
    ["accent", "bg-accent"],
    ["accent-lift", "bg-accent-lift"],
    ["paper", "bg-paper"],
  ] as const

  return (
    <div className="min-h-screen bg-app text-ink">
      <header className="border-b border-line px-[var(--pad-container)] py-5">
        <h1 className="font-serif text-2xl leading-7">Biblioteca PDF</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
          Paso 3 . tokens y tipografia
        </p>
      </header>
      

      <main className="px-[var(--pad-container)] py-8">
        <h2 className="font-serif text-[44px] leading-[46px] tracking-[0.015em]">
          Estetica nocturna
        </h2>
        <p className="mt-3 max-2-[60ch] text-ink-muted">
          Cuerpo de interfaz en IBM Plex Sans 15/24. Si el titulo se ve en serif y esete parrafo en palo seco, las fuentes cargaron bien
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {swatches.map(([name, cls]) => (
            <div key={name} className="w-28">
              <div className={`h-16 rounded-sm border border-line  ${cls}`}>
                <span className="mt-1 block font-mono text-[11px] text-ink-muted">
                  {name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
