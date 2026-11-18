import { useEffect, useState } from "react"
import axios from "axios"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiCpu,
  FiFileText,
  FiGithub,
  FiRefreshCw,
  FiStar,
  FiTarget,
  FiTerminal,
  FiTrendingUp,
  FiUploadCloud,
  FiXCircle,
  FiZap
} from "react-icons/fi"
import "react-circular-progressbar/dist/styles.css"

const API = "https://ai-resume-analyzer-uptg.onrender.com"

const TABS = [
  { id: "analysis", label: "Analysis", short: "ANALYSIS", icon: FiActivity, key: "1" },
  { id: "match", label: "Job Match", short: "MATCH", icon: FiTarget, key: "2" },
  { id: "improve", label: "Bullet Improver", short: "BULLETS", icon: FiZap, key: "3" }
]

const LOAD_STEPS = [
  "Parsing document",
  "Extracting sections",
  "Scoring ATS compatibility",
  "Generating 12-point report"
]

const STATUS = {
  good: {
    label: "GOOD",
    pill: "border-ok/30 bg-ok/10 text-ok",
    rule: "border-l-ok/50",
    icon: FiCheckCircle,
    iconColor: "text-ok"
  },
  "needs-improvement": {
    label: "IMPROVE",
    pill: "border-warn/30 bg-warn/10 text-warn",
    rule: "border-l-warn/50",
    icon: FiTrendingUp,
    iconColor: "text-warn"
  },
  missing: {
    label: "MISSING",
    pill: "border-bad/30 bg-bad/10 text-bad",
    rule: "border-l-bad/50",
    icon: FiXCircle,
    iconColor: "text-bad"
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function useCountUp(target, duration = 900) {
  const targetValue = Number.isFinite(target) ? target : 0
  const [value, setValue] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (reduce) {
      const raf = requestAnimationFrame(() => setValue(targetValue))
      return () => cancelAnimationFrame(raf)
    }

    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(targetValue * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [targetValue, duration])

  return value
}

function scoreMeta(score = 0) {
  if (score >= 70) return { label: "STRONG", className: "text-ok" }
  if (score >= 40) return { label: "NEEDS WORK", className: "text-warn" }
  return { label: "CRITICAL", className: "text-bad" }
}

function formatSize(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const wordCount = (text = "") => (text.trim() ? text.trim().split(/\s+/).length : 0)

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Corners() {
  const base = "pointer-events-none absolute z-10 h-5 w-5 border-accent/50"
  return (
    <>
      <span className={`${base} left-0 top-0 rounded-tl-[3px] border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 rounded-tr-[3px] border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 rounded-bl-[3px] border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 rounded-br-[3px] border-b-2 border-r-2`} />
    </>
  )
}

function Bezel({ children, highlighted = false, className = "" }) {
  const edge = highlighted
    ? "bg-gradient-to-b from-accent/45 via-white/10 to-transparent"
    : "bg-gradient-to-b from-white/12 to-white/[0.02]"

  return (
    <div className={`relative rounded-xl p-px ${edge} ${className}`}>
      <div className="h-full w-full rounded-[11px] bg-panel/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        {children}
      </div>
    </div>
  )
}

function SectionHead({ index, children, right }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-accent/70">{index}</span>
        <span className="h-px w-6 bg-line" />
        <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">{children}</h2>
      </div>
      {right ? (
        <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted/60 sm:block">{right}</span>
      ) : null}
    </div>
  )
}

function PanelHead({ icon, tone = "text-accent", children, right }) {
  const Icon = icon

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <Icon size={13} className={tone} />
        {children}
      </h3>
      {right ? <span className="font-mono text-[10px] tabular-nums text-muted/60">{right}</span> : null}
    </div>
  )
}

function Meter({ label, value = 0, delay = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm text-ink/80">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted">
          {String(clamped).padStart(2, "0")}
          <span className="text-muted/40">/100</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent shadow-[0_0_14px_rgba(34,211,238,0.45)]"
        />
      </div>
    </div>
  )
}

function PreviewMeter({ label, value }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px] tracking-[0.16em] text-muted/70">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent/80"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function ScoreRing({ value = 0, size = 168, suffix = "" }) {
  const animated = useCountUp(value)
  const color = value >= 70 ? "#22d3ee" : value >= 40 ? "#fbbf24" : "#fb7185"

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <div className="pointer-events-none absolute inset-4 rounded-full opacity-30 blur-2xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="0.7"
          strokeDasharray="0.6 2.6"
        />
      </svg>
      <div className="score-ring" style={{ filter: `drop-shadow(0 0 16px ${color}45)` }}>
        <CircularProgressbar
          value={animated}
          text={`${animated}${suffix}`}
          strokeWidth={7}
          styles={buildStyles({
            textColor: "#e6edf7",
            pathColor: color,
            trailColor: "rgba(255,255,255,0.06)",
            textSize: suffix ? "24px" : "30px",
            strokeLinecap: "round",
            pathTransitionDuration: 0.15
          })}
        />
      </div>
    </div>
  )
}

function Chip({ children, tone = "neutral", dot = false }) {
  const tones = {
    accent: "border-accent/30 bg-accent/10 text-accent",
    ok: "border-ok/30 bg-ok/10 text-ok",
    warn: "border-warn/30 bg-warn/10 text-warn",
    bad: "border-bad/30 bg-bad/10 text-bad",
    neutral: "border-line bg-white/[0.03] text-muted"
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      {dot ? <span className="h-1 w-1 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}

function PrimaryButton({ onClick, disabled, loading, label, loadingLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-5 py-2.5 font-mono text-[11px] tracking-[0.16em] text-accent transition-all hover:border-accent/60 hover:bg-accent/15 hover:shadow-[0_0_30px_-8px_rgba(34,211,238,0.55)] disabled:cursor-not-allowed disabled:border-line disabled:bg-white/[0.02] disabled:text-muted/50 disabled:shadow-none"
    >
      {loading ? (
        <FiRefreshCw size={14} className="animate-spin" />
      ) : (
        <FiArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      )}
      {loading ? loadingLabel : label}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export default function UploadResume() {
  const [analysis, setAnalysis] = useState(null)
  const [resumeText, setResumeText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("analysis")

  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [stage, setStage] = useState(0)

  const [jobDescription, setJobDescription] = useState("")
  const [match, setMatch] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState("")

  const [bullet, setBullet] = useState("")
  const [improved, setImproved] = useState(null)
  const [bulletLoading, setBulletLoading] = useState(false)
  const [bulletError, setBulletError] = useState("")
  const [copied, setCopied] = useState(false)

  // Advance the fake-but-honest pipeline log while the request is in flight.
  useEffect(() => {
    if (!loading) {
      setStage(0)
      return
    }

    const id = setInterval(() => setStage((s) => Math.min(s + 1, LOAD_STEPS.length - 1)), 1400)
    return () => clearInterval(id)
  }, [loading])

  // 1 / 2 / 3 switches report tabs.
  useEffect(() => {
    if (!analysis) return

    const onKey = (event) => {
      const tag = event.target?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || event.metaKey || event.ctrlKey || event.altKey) return
      const tab = TABS.find((t) => t.key === event.key)
      if (tab) setActiveTab(tab.id)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [analysis])

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileSize(formatSize(file.size))

    const formData = new FormData()
    formData.append("resume", file)

    setLoading(true)
    setError("")
    setAnalysis(null)
    setMatch(null)
    setImproved(null)

    try {
      const res = await axios.post(`${API}/api/resume/upload`, formData)
      const data = res.data

      if (!data.analysis?.isResume) {
        setError(data.analysis?.error || "This doesn't appear to be a valid resume.")
        return
      }

      setAnalysis(data.analysis)
      setResumeText(data.resumeText)
      setActiveTab("analysis")
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.analysis?.error ||
          "Upload failed. Please try again."
      )
    } finally {
      setLoading(false)
      event.target.value = ""
    }
  }

  const checkMatch = async () => {
    if (!resumeText || !jobDescription.trim()) return

    setMatchLoading(true)
    setMatch(null)
    setMatchError("")

    try {
      const res = await axios.post(`${API}/api/resume/match`, {
        resumeText,
        jobDescription
      })
      setMatch(res.data)
    } catch (err) {
      setMatchError(err?.response?.data?.error || "Match analysis failed. Please try again.")
    } finally {
      setMatchLoading(false)
    }
  }

  const improve = async () => {
    if (!bullet.trim()) return

    setBulletLoading(true)
    setImproved(null)
    setBulletError("")

    try {
      const res = await axios.post(`${API}/api/resume/improve`, { text: bullet })
      setImproved(res.data)
    } catch (err) {
      setBulletError(err?.response?.data?.error || "Bullet improvement failed. Please try again.")
    } finally {
      setBulletLoading(false)
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  const reset = () => {
    setAnalysis(null)
    setResumeText("")
    setError("")
    setFileName("")
    setFileSize("")
    setMatch(null)
    setMatchError("")
    setJobDescription("")
    setImproved(null)
    setBullet("")
    setBulletError("")
    setActiveTab("analysis")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const meta = scoreMeta(analysis?.score)

  return (
    <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-6 sm:px-8">

      {/* NAV */}
      <header className="mb-14 flex items-center justify-between gap-4 border-b border-line pb-4 sm:mb-20">
        <div className="flex items-center gap-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-lg border border-accent/25 bg-accent/[0.06]">
            <FiTerminal size={16} className="text-accent" />
            <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_#22d3ee]" />
          </div>
          <div className="leading-none">
            <p className="font-mono text-[11px] tracking-[0.26em] text-ink">
              RESUME<span className="text-accent">//</span>ANALYZER
            </p>
            <p className="mt-1.5 font-mono text-[9px] tracking-[0.2em] text-muted/70">
              DIAGNOSTICS CONSOLE · V2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />
            ATS ENGINE READY
          </span>
          <a
            href="https://github.com/notrishabhsingh/ai-resume-analyzer"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/[0.02] text-muted transition-colors hover:border-accent/30 hover:text-accent"
          >
            <FiGithub size={15} />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] tracking-[0.22em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            SYSTEM // RESUME DIAGNOSTICS
          </div>

          <h1 className="font-display text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-[3.1rem] xl:text-[3.5rem] 2xl:text-6xl">
            Decode what
            <br />
            recruiters{" "}
            <span className="bg-gradient-to-r from-accent via-cyan-200 to-iris bg-clip-text text-transparent">
              actually see.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            Upload a resume and get a 12-point technical audit, an ATS compatibility score, and a
            line-by-line job match — in under ten seconds.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Chip tone="accent" dot>
              12 CHECKPOINTS
            </Chip>
            <Chip>ATS SCORING</Chip>
            <Chip>JOB MATCH</Chip>
          </div>
        </div>

        {/* Sample output panel */}
        <div className="lg:col-span-5">
          <Bezel highlighted className="shadow-[0_30px_80px_-40px_rgba(34,211,238,0.45)]">
            <div className="relative overflow-hidden rounded-[11px] p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

              <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-muted/70">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  SAMPLE OUTPUT
                </span>
                <span>ATS / 2026</span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <ScoreRing value={82} size={124} />
                <div className="flex-1 space-y-3">
                  <PreviewMeter label="CONTENT" value={86} />
                  <PreviewMeter label="ATS" value={91} />
                  <PreviewMeter label="IMPACT" value={72} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3 font-mono text-[9px] tracking-[0.18em] text-muted/70">
                <span>12 / 12 CHECKS RUN</span>
                <span className="text-ok">READY</span>
              </div>
            </div>
          </Bezel>
        </div>
      </section>

      {/* UPLOAD */}
      <section className="mt-16 sm:mt-20">
        <SectionHead index="01" right="PDF · MAX 10MB">
          INPUT // RESUME
        </SectionHead>

        <div className="mt-4">
          <Bezel
            highlighted={Boolean(fileName)}
            className={loading ? "shadow-[0_0_60px_-24px_rgba(34,211,238,0.5)]" : ""}
          >
            <div className="relative overflow-hidden rounded-[11px]">
              <Corners />

              <label
                className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 px-6 py-14 text-center transition-colors ${
                  loading ? "pointer-events-none bg-panel/40" : "hover:bg-white/[0.02]"
                }`}
              >
                <span className="scan-ring pointer-events-none absolute inset-0 rounded-[11px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <span className="relative grid h-14 w-14 place-items-center rounded-xl border border-line bg-white/[0.02] transition-transform duration-300 group-hover:-translate-y-0.5">
                  <FiUploadCloud size={24} className="text-accent" />
                </span>

                <span className="relative">
                  <span className="block font-display text-lg font-medium text-ink">
                    Drop your resume into the scanner
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted/70">
                    CLICK TO BROWSE · PDF ONLY · MAX 10MB
                  </span>
                </span>

                <input
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  disabled={loading}
                  onChange={upload}
                />
              </label>

              {fileName ? (
                <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FiFileText size={15} className="shrink-0 text-accent" />
                    <span className="truncate font-mono text-[11px] text-ink/80">{fileName}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-muted">
                    {fileSize}
                  </span>
                </div>
              ) : null}
            </div>
          </Bezel>

          {/* ERROR */}
          <AnimatePresence>
            {error ? (
              <Motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-start gap-3 rounded-lg border border-bad/30 bg-bad/[0.06] px-4 py-3"
              >
                <FiAlertCircle size={15} className="mt-0.5 shrink-0 text-bad" />
                <div>
                  <p className="font-mono text-[9px] tracking-[0.22em] text-bad">ERR // UPLOAD</p>
                  <p className="mt-1 text-sm leading-relaxed text-bad/80">{error}</p>
                </div>
              </Motion.div>
            ) : null}
          </AnimatePresence>

          {/* PIPELINE LOG */}
          <AnimatePresence>
            {loading ? (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  aria-live="polite"
                  className="mt-3 rounded-lg border border-line bg-panel/70 px-5 py-4"
                >
                  <div className="mb-3 flex items-center justify-between font-mono text-[9px] tracking-[0.22em] text-muted/70">
                    <span className="flex items-center gap-2 text-accent/80">
                      <FiCpu size={12} />
                      ANALYZING
                      <span className="caret text-accent">▮</span>
                    </span>
                    <span className="tabular-nums">{Math.min(94, 10 + stage * 27)}%</span>
                  </div>

                  <div className="mb-4 h-1 rounded-full bg-white/5">
                    <Motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                      initial={{ width: "6%" }}
                      animate={{ width: `${Math.min(94, 10 + stage * 27)}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>

                  <ul className="space-y-2">
                    {LOAD_STEPS.map((step, i) => {
                      const done = i < stage
                      const active = i === stage
                      return (
                        <li
                          key={step}
                          className={`flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] ${
                            done ? "text-muted/60" : active ? "text-accent" : "text-muted/30"
                          }`}
                        >
                          {done ? (
                            <FiCheck size={12} />
                          ) : active ? (
                            <FiRefreshCw size={12} className="animate-spin" />
                          ) : (
                            <span className="h-3 w-3 rounded-full border border-line" />
                          )}
                          {step.toUpperCase()}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* REPORT */}
      {analysis ? (
        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-muted/70">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              REPORT GENERATED
              {fileName ? (
                <span className="truncate text-muted/40">· {fileName.toUpperCase()}</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={reset}
              className="ml-auto font-mono text-[9px] tracking-[0.2em] text-muted transition-colors hover:text-accent"
            >
              NEW SCAN →
            </button>
          </div>

          {/* TABS */}
          <div
            role="tablist"
            aria-label="Report sections"
            className="relative mb-6 flex gap-1 overflow-x-auto rounded-lg border border-line bg-panel/70 p-1"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] transition-colors ${
                    active ? "text-void" : "text-muted hover:text-ink"
                  }`}
                >
                  {active ? (
                    <Motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-md bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative flex items-center gap-2">
                    <Icon size={13} />
                    {tab.short}
                  </span>
                  <span
                    className={`relative hidden rounded border px-1 text-[8px] sm:inline ${
                      active ? "border-void/25 text-void/70" : "border-line text-muted/50"
                    }`}
                  >
                    {tab.key}
                  </span>
                </button>
              )
            })}
          </div>

          {/* TAB: ANALYSIS */}
          {activeTab === "analysis" ? (
            <Motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="grid gap-4 lg:grid-cols-5">
                <Bezel highlighted className="lg:col-span-2">
                  <div className="flex h-full flex-col items-center justify-between gap-5 p-6">
                    <div className="flex w-full items-center justify-between font-mono text-[9px] tracking-[0.2em] text-muted/70">
                      <span>OVERALL SCORE</span>
                      <span>ATS / CV</span>
                    </div>

                    <ScoreRing value={analysis.score ?? 0} />

                    <div className="w-full space-y-2 border-t border-line pt-3">
                      <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.16em] text-muted/60">
                        <span>12 CHECKPOINTS</span>
                        <span className={meta.className}>{meta.label}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-white/5">
                        <Motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, Math.min(100, analysis.score ?? 0))}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent"
                        />
                      </div>
                    </div>
                  </div>
                </Bezel>

                <Bezel className="lg:col-span-3">
                  <div className="p-6">
                    <PanelHead icon={FiActivity} right="04 METRICS">
                      SCORE BREAKDOWN
                    </PanelHead>
                    <div className="space-y-5">
                      <Meter label="Content quality" value={analysis.scoreBreakdown?.contentQuality ?? 0} />
                      <Meter
                        label="ATS compatibility"
                        value={analysis.scoreBreakdown?.atsCompatibility ?? 0}
                        delay={0.06}
                      />
                      <Meter
                        label="Technical skills"
                        value={analysis.scoreBreakdown?.technicalSkills ?? 0}
                        delay={0.12}
                      />
                      <Meter
                        label="Experience impact"
                        value={analysis.scoreBreakdown?.experienceImpact ?? 0}
                        delay={0.18}
                      />
                    </div>
                  </div>
                </Bezel>
              </div>

              {/* Detailed analysis */}
              <Bezel>
                <div className="p-6">
                  <PanelHead icon={FiCpu} right={`${analysis.detailedAnalysis?.length || 0} POINTS`}>
                    DETAILED ANALYSIS
                  </PanelHead>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {analysis.detailedAnalysis?.map((item, i) => (
                      <Motion.div
                        key={`${item.point}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.035, 0.4) }}
                        className="group relative rounded-lg border border-line bg-white/[0.015] p-4 transition-colors hover:border-accent/25 hover:bg-accent/[0.03]"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 font-mono text-[10px] tabular-nums text-accent/60">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h4 className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink/90">
                              {item.point}
                            </h4>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.details}</p>
                          </div>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </div>
              </Bezel>

              {/* Strengths / weaknesses / skills */}
              <div className="grid gap-4 md:grid-cols-3">
                <Bezel>
                  <div className="p-5">
                    <PanelHead icon={FiCheckCircle} tone="text-ok">
                      STRENGTHS
                    </PanelHead>
                    <ul className="space-y-2.5">
                      {analysis.strengths?.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Bezel>

                <Bezel>
                  <div className="p-5">
                    <PanelHead icon={FiAlertCircle} tone="text-warn">
                      WEAKNESSES
                    </PanelHead>
                    <ul className="space-y-2.5">
                      {analysis.weaknesses?.map((item, i) => (
                        <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Bezel>

                <Bezel>
                  <div className="p-5">
                    <PanelHead icon={FiStar} tone="text-iris" right={analysis.skills?.length || 0}>
                      DETECTED SKILLS
                    </PanelHead>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills?.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-iris/20 bg-iris/[0.08] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-iris/90"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Bezel>
              </div>

              {/* Improvements */}
              <Bezel>
                <div className="p-6">
                  <PanelHead icon={FiTrendingUp}>SUGGESTED IMPROVEMENTS</PanelHead>
                  <ul className="divide-y divide-line">
                    {analysis.improvements?.map((item, i) => (
                      <li key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="font-mono text-[10px] tabular-nums text-accent/60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[13px] leading-relaxed text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Bezel>
            </Motion.div>
          ) : null}

          {/* TAB: JOB MATCH */}
          {activeTab === "match" ? (
            <Motion.div
              key="match"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <Bezel>
                <div className="p-6">
                  <PanelHead icon={FiTarget} right={`${wordCount(jobDescription)} WORDS`}>
                    INPUT // JOB DESCRIPTION
                  </PanelHead>

                  <textarea
                    rows={8}
                    className="w-full resize-none rounded-lg border border-line bg-void/60 p-4 text-sm leading-relaxed text-ink placeholder:text-muted/40 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-muted/50">
                      PASTE THE FULL POSTING FOR BEST ACCURACY
                    </p>
                    <PrimaryButton
                      onClick={checkMatch}
                      disabled={matchLoading || !jobDescription.trim()}
                      loading={matchLoading}
                      label="ANALYZE MATCH"
                      loadingLabel="ANALYZING"
                    />
                  </div>

                  {matchError ? (
                    <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-bad">{matchError}</p>
                  ) : null}
                </div>
              </Bezel>

              {match ? (
                <Motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 lg:grid-cols-5">
                    <Bezel highlighted className="lg:col-span-2">
                      <div className="flex h-full flex-col items-center justify-between gap-5 p-6">
                        <div className="flex w-full items-center justify-between font-mono text-[9px] tracking-[0.2em] text-muted/70">
                          <span>MATCH SCORE</span>
                          <span>JD / CV</span>
                        </div>

                        <ScoreRing value={match.matchScore ?? 0} suffix="%" size={156} />

                        <div className="flex w-full items-center justify-center gap-4 font-mono text-[9px] tracking-[0.16em] text-muted/60">
                          <span>
                            <span className="text-ok">{match.matchingSkills?.length || 0}</span> MATCHED
                          </span>
                          <span className="h-3 w-px bg-line" />
                          <span>
                            <span className="text-bad">{match.missingSkills?.length || 0}</span> GAPS
                          </span>
                        </div>

                        <div className="w-full border-t border-line pt-3 text-center font-mono text-[9px] tracking-[0.18em]">
                          {match.matchScore >= 70 ? (
                            <span className="text-ok">STRONG FIT</span>
                          ) : match.matchScore >= 40 ? (
                            <span className="text-warn">PARTIAL FIT</span>
                          ) : (
                            <span className="text-bad">LOW FIT</span>
                          )}
                        </div>
                      </div>
                    </Bezel>

                    <Bezel className="lg:col-span-3">
                      <div className="p-6">
                        <PanelHead icon={FiActivity} right="04 METRICS">
                          CATEGORY SCORES
                        </PanelHead>
                        <div className="space-y-5">
                          <Meter label="Skills match" value={match.categoryScores?.skills ?? 0} />
                          <Meter
                            label="Experience relevance"
                            value={match.categoryScores?.experience ?? 0}
                            delay={0.06}
                          />
                          <Meter
                            label="Education match"
                            value={match.categoryScores?.education ?? 0}
                            delay={0.12}
                          />
                          <Meter
                            label="Overall fit"
                            value={match.categoryScores?.overallFit ?? 0}
                            delay={0.18}
                          />
                        </div>
                      </div>
                    </Bezel>
                  </div>

                  <Bezel>
                    <div className="relative overflow-hidden p-6">
                      <span className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-accent/60 via-accent/10 to-transparent" />
                      <h3 className="font-mono text-[9px] tracking-[0.22em] text-accent">OVERALL VERDICT</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink/85">{match.overallVerdict}</p>
                    </div>
                  </Bezel>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Bezel>
                      <div className="p-5">
                        <PanelHead icon={FiCheckCircle} tone="text-ok">
                          MATCHING SKILLS
                        </PanelHead>
                        <div className="flex flex-wrap gap-1.5">
                          {match.matchingSkills?.length ? (
                            match.matchingSkills.map((skill, i) => (
                              <Chip key={i} tone="ok">
                                {skill}
                              </Chip>
                            ))
                          ) : (
                            <p className="font-mono text-[10px] text-muted/50">NONE DETECTED</p>
                          )}
                        </div>
                      </div>
                    </Bezel>

                    <Bezel>
                      <div className="p-5">
                        <PanelHead icon={FiXCircle} tone="text-bad">
                          MISSING SKILLS
                        </PanelHead>
                        <div className="flex flex-wrap gap-1.5">
                          {match.missingSkills?.length ? (
                            match.missingSkills.map((skill, i) => (
                              <Chip key={i} tone="bad">
                                {skill}
                              </Chip>
                            ))
                          ) : (
                            <p className="font-mono text-[10px] text-muted/50">NONE DETECTED</p>
                          )}
                        </div>
                      </div>
                    </Bezel>

                    <Bezel>
                      <div className="p-5">
                        <PanelHead icon={FiTrendingUp} tone="text-warn">
                          SUGGESTED TO ADD
                        </PanelHead>
                        <div className="flex flex-wrap gap-1.5">
                          {match.suggestedSkills?.length ? (
                            match.suggestedSkills.map((skill, i) => (
                              <Chip key={i} tone="warn">
                                {skill}
                              </Chip>
                            ))
                          ) : (
                            <p className="font-mono text-[10px] text-muted/50">NONE DETECTED</p>
                          )}
                        </div>
                      </div>
                    </Bezel>
                  </div>

                  <Bezel>
                    <div className="p-6">
                      <PanelHead icon={FiTarget} right={`${match.detailedFeedback?.length || 0} AREAS`}>
                        DETAILED FEEDBACK
                      </PanelHead>
                      <div className="space-y-2">
                        {match.detailedFeedback?.map((item, i) => {
                          const status = STATUS[item.status] || STATUS["needs-improvement"]
                          const Icon = status.icon
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-3 rounded-r-lg border-l-2 bg-white/[0.015] p-3.5 ${status.rule}`}
                            >
                              <Icon size={15} className={`mt-0.5 shrink-0 ${status.iconColor}`} />
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                  <h4 className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/90">
                                    {item.area}
                                  </h4>
                                  <span
                                    className={`rounded border px-1.5 py-0.5 font-mono text-[8px] tracking-[0.14em] ${status.pill}`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-[13px] leading-relaxed text-muted">{item.comment}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Bezel>
                </Motion.div>
              ) : null}
            </Motion.div>
          ) : null}

          {/* TAB: BULLET IMPROVER */}
          {activeTab === "improve" ? (
            <Motion.div
              key="improve"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <Bezel>
                <div className="p-6">
                  <PanelHead icon={FiZap} right={`${bullet.length} CHARS`}>
                    INPUT // BULLET POINT
                  </PanelHead>

                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-lg border border-line bg-void/60 p-4 text-sm leading-relaxed text-ink placeholder:text-muted/40 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    placeholder="e.g. Was responsible for managing the team and handling tasks..."
                    value={bullet}
                    onChange={(e) => setBullet(e.target.value)}
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-muted/50">
                      ONE ACHIEVEMENT PER LINE WORKS BEST
                    </p>
                    <PrimaryButton
                      onClick={improve}
                      disabled={bulletLoading || !bullet.trim()}
                      loading={bulletLoading}
                      label="IMPROVE BULLET"
                      loadingLabel="IMPROVING"
                    />
                  </div>

                  {bulletError ? (
                    <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-bad">{bulletError}</p>
                  ) : null}
                </div>
              </Bezel>

              {improved ? (
                <Motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Bezel>
                      <div className="p-6">
                        <PanelHead icon={FiFileText}>ORIGINAL</PanelHead>
                        <p className="text-[13px] italic leading-relaxed text-muted">
                          &ldquo;{improved.original}&rdquo;
                        </p>
                      </div>
                    </Bezel>

                    <Bezel highlighted>
                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                            <FiZap size={13} />
                            OPTIMIZED
                          </h3>
                          <button
                            type="button"
                            onClick={() => copyText(improved.improvedVersion)}
                            className="inline-flex items-center gap-1.5 rounded border border-accent/25 bg-accent/10 px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-accent transition-colors hover:bg-accent/20"
                          >
                            {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
                            {copied ? "COPIED" : "COPY"}
                          </button>
                        </div>
                        <p className="text-[13px] leading-relaxed text-ink">
                          &ldquo;{improved.improvedVersion}&rdquo;
                        </p>
                      </div>
                    </Bezel>
                  </div>

                  <Bezel>
                    <div className="p-6">
                      <PanelHead icon={FiStar} tone="text-iris">
                        WHY THIS IS BETTER
                      </PanelHead>
                      <p className="text-[13px] leading-relaxed text-muted">{improved.whyBetter}</p>
                    </div>
                  </Bezel>

                  <Bezel>
                    <div className="p-6">
                      <PanelHead
                        icon={FiTrendingUp}
                        right={`${improved.actionableSteps?.length || 0} STEPS`}
                      >
                        ACTIONABLE STEPS
                      </PanelHead>
                      <div className="space-y-2.5">
                        {improved.actionableSteps?.map((step, i) => (
                          <div key={i} className="rounded-lg border border-line bg-white/[0.015] p-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-0.5 font-mono text-[10px] tabular-nums text-accent/60">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[13px] font-medium text-ink/90">{step.step}</h4>
                                <div className="mt-2 rounded border border-line bg-void/50 p-3">
                                  <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted/50">
                                    EXAMPLE
                                  </span>
                                  <p className="mt-1 text-[12px] italic leading-relaxed text-muted">
                                    &ldquo;{step.example}&rdquo;
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Bezel>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Bezel>
                      <div className="p-5">
                        <PanelHead icon={FiAlertCircle} tone="text-warn">
                          PRO TIPS
                        </PanelHead>
                        <ul className="space-y-2.5">
                          {improved.tips?.map((tip, i) => (
                            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warn" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Bezel>

                    <Bezel>
                      <div className="p-5">
                        <PanelHead icon={FiStar} tone="text-iris" right={improved.alternatives?.length || 0}>
                          ALTERNATIVE VERSIONS
                        </PanelHead>
                        <ul className="space-y-2">
                          {improved.alternatives?.map((alt, i) => (
                            <li
                              key={i}
                              className="rounded-lg border border-line bg-white/[0.015] p-3 text-[12px] italic leading-relaxed text-muted"
                            >
                              &ldquo;{alt}&rdquo;
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Bezel>
                  </div>
                </Motion.div>
              ) : null}
            </Motion.div>
          ) : null}
        </section>
      ) : null}

      {/* FOOTER */}
      <footer className="mt-20 flex flex-col items-center justify-between gap-2 border-t border-line pt-5 font-mono text-[9px] tracking-[0.18em] text-muted/50 sm:flex-row">
        <span>AI RESUME ANALYZER · REACT + GROQ</span>
        <span>FILES PROCESSED IN MEMORY · NOT STORED</span>
      </footer>
    </div>
  )
}
