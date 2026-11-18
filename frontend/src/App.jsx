import UploadResume from "./components/UploadResume"

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-ink">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60" />

        <div className="absolute -left-56 -top-64 h-[560px] w-[560px] rounded-full bg-accent/10 blur-[170px] animate-aurora" />
        <div className="absolute -bottom-72 -right-52 h-[620px] w-[620px] rounded-full bg-iris/[0.08] blur-[190px] animate-aurora-slow" />
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-[150px]" />

        <div className="absolute inset-0 vignette" />
      </div>

      <div className="noise" aria-hidden="true" />

      <UploadResume />
    </div>
  )
}

export default App
