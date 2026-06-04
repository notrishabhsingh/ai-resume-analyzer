import axios from "axios"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { FiUploadCloud, FiCheckCircle, FiXCircle, FiTrendingUp, FiStar, FiAlertCircle, FiRefreshCw } from "react-icons/fi"
import "react-circular-progressbar/dist/styles.css"

const API = "https://ai-resume-analyzer-uptg.onrender.com"

function UploadResume() {
  const [analysis, setAnalysis] = useState(null)
  const [resumeText, setResumeText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("analysis")

  const [jobDescription, setJobDescription] = useState("")
  const [match, setMatch] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)

  const [bullet, setBullet] = useState("")
  const [improved, setImproved] = useState(null)
  const [bulletLoading, setBulletLoading] = useState(false)

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("resume", file)

    setLoading(true)
    setError("")
    setAnalysis(null)
    setMatch(null)

    try {
      const res = await axios.post(`${API}/api/resume/upload`, formData)
      const data = res.data

      if (!data.analysis.isResume) {
        setError(data.analysis.error || "This doesn't appear to be a valid resume.")
        setLoading(false)
        return
      }

      setAnalysis(data.analysis)
      setResumeText(data.resumeText)
    } catch {
      setError("Upload failed. Please try again.")
    }

    setLoading(false)
  }

  const checkMatch = async () => {
    if (!resumeText || !jobDescription.trim()) return

    setMatchLoading(true)
    setMatch(null)

    try {
      const res = await axios.post(`${API}/api/resume/match`, {
        resumeText,
        jobDescription
      })
      setMatch(res.data)
    } catch {
      setMatch(null)
    }

    setMatchLoading(false)
  }

  const improve = async () => {
    if (!bullet.trim()) return

    setBulletLoading(true)
    setImproved(null)

    try {
      const res = await axios.post(`${API}/api/resume/improve`, { text: bullet })
      setImproved(res.data)
    } catch {
      setImproved(null)
    }

    setBulletLoading(false)
  }

  const statusColor = (status) => {
    if (status === "good") return "text-green-400"
    if (status === "needs-improvement") return "text-yellow-400"
    return "text-red-400"
  }

  const statusIcon = (status) => {
    if (status === "good") return <FiCheckCircle className="text-green-400 shrink-0" size={20} />
    if (status === "needs-improvement") return <FiTrendingUp className="text-yellow-400 shrink-0" size={20} />
    return <FiXCircle className="text-red-400 shrink-0" size={20} />
  }

  return (
    <div className="w-full max-w-6xl mx-auto text-white px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-center mb-2"
      >
        AI Resume Analyzer
      </motion.h1>
      <p className="text-center text-gray-400 mb-10 text-lg">
        Upload your resume and get a detailed AI-powered analysis
      </p>

      {/* UPLOAD AREA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mb-10 text-center"
      >
        <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-indigo-400/60 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
          <FiUploadCloud size={52} className="text-indigo-300 mb-4 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-semibold">Click to Upload Resume</span>
          <span className="text-gray-400 text-sm mt-1">PDF files only</span>
          <input type="file" hidden onChange={upload} accept=".pdf" />
        </label>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3"
          >
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>

      {/* LOADING */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center gap-3 text-indigo-300 text-lg">
              <FiRefreshCw className="animate-spin" size={24} />
              AI is analyzing your resume...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULTS */}
      {analysis && (
        <>
          {/* TABS */}
          <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 border border-white/10">
            {[
              { id: "analysis", label: "Resume Analysis", icon: FiStar },
              { id: "match", label: "Job Match", icon: FiTrendingUp },
              { id: "improve", label: "Bullet Improver", icon: FiCheckCircle }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* TAB: ANALYSIS */}
          {activeTab === "analysis" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* SCORE ROW */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center">
                  <h3 className="text-lg mb-4 text-gray-300">Overall Score</h3>
                  <div className="w-44 mx-auto">
                    <CircularProgressbar
                      value={analysis.score}
                      text={`${analysis.score}`}
                      styles={buildStyles({
                        textColor: "#fff",
                        pathColor: analysis.score >= 70 ? "#8b5cf6" : analysis.score >= 40 ? "#f59e0b" : "#ef4444",
                        trailColor: "#1f2937",
                        textSize: "28px"
                      })}
                    />
                  </div>
                </div>

                <div className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                  <h3 className="text-lg mb-5 text-gray-300">Score Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Content Quality", value: analysis.scoreBreakdown.contentQuality },
                      { label: "ATS Compatibility", value: analysis.scoreBreakdown.atsCompatibility },
                      { label: "Technical Skills", value: analysis.scoreBreakdown.technicalSkills },
                      { label: "Experience Impact", value: analysis.scoreBreakdown.experienceImpact }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span>{item.value}/100</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DETAILED ANALYSIS - 10-12 POINTS */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <FiStar className="text-indigo-400" />
                  Detailed Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.detailedAnalysis?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.06] transition-all"
                    >
                      <h4 className="font-semibold text-indigo-300 mb-2 text-sm uppercase tracking-wider">
                        {i + 1}. {item.point}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{item.details}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* STRENGTHS / WEAKNESSES / SKILLS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-green-300">
                    <FiCheckCircle size={18} />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                    <FiAlertCircle size={18} />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses?.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-purple-300">
                    <FiStar size={18} />
                    Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills?.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/20 rounded-lg text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* IMPROVEMENTS */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-indigo-400" />
                  Suggested Improvements
                </h3>
                <ul className="space-y-3">
                  {analysis.improvements?.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-6 h-6 shrink-0 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB: JOB MATCH */}
          {activeTab === "match" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-2">Job Description Match</h3>
                <p className="text-gray-400 text-sm mb-5">
                  Paste the full job description below to see how well your resume matches.
                </p>
                <textarea
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  rows={8}
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <button
                  onClick={checkMatch}
                  disabled={matchLoading || !jobDescription.trim()}
                  className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
                >
                  {matchLoading ? (
                    <span className="flex items-center gap-2">
                      <FiRefreshCw className="animate-spin" size={18} />
                      Analyzing...
                    </span>
                  ) : (
                    "Analyze Match"
                  )}
                </button>
              </div>

              {/* MATCH RESULTS */}
              {match && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* MATCH SCORE */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center">
                      <h3 className="text-lg mb-4 text-gray-300">Match Score</h3>
                      <div className="w-44 mx-auto">
                        <CircularProgressbar
                          value={match.matchScore}
                          text={`${match.matchScore}%`}
                          styles={buildStyles({
                            textColor: "#fff",
                            pathColor: match.matchScore >= 70 ? "#8b5cf6" : match.matchScore >= 40 ? "#f59e0b" : "#ef4444",
                            trailColor: "#1f2937",
                            textSize: "24px"
                          })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                      <h3 className="text-lg mb-5 text-gray-300">Category Scores</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Skills Match", value: match.categoryScores?.skills ?? 0 },
                          { label: "Experience Match", value: match.categoryScores?.experience ?? 0 },
                          { label: "Education Match", value: match.categoryScores?.education ?? 0 },
                          { label: "Overall Fit", value: match.categoryScores?.overallFit ?? 0 }
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{item.label}</span>
                              <span>{item.value}/100</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* VERDICT */}
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                    <h3 className="font-semibold mb-2">Overall Verdict</h3>
                    <p className="text-gray-300">{match.overallVerdict}</p>
                  </div>

                  {/* SKILLS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-4 text-green-300 flex items-center gap-2">
                        <FiCheckCircle size={16} />
                        Matching Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.matchingSkills?.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-green-500/20 border border-green-500/20 rounded-lg text-sm">
                            {s}
                          </span>
                        )) || <p className="text-gray-500 text-sm">No matching skills found</p>}
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-4 text-red-300 flex items-center gap-2">
                        <FiXCircle size={16} />
                        Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills?.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/20 rounded-lg text-sm">
                            {s}
                          </span>
                        )) || <p className="text-gray-500 text-sm">No missing skills</p>}
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-4 text-yellow-300 flex items-center gap-2">
                        <FiTrendingUp size={16} />
                        Suggested to Add
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {match.suggestedSkills?.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-sm">
                            {s}
                          </span>
                        )) || <p className="text-gray-500 text-sm">No suggestions</p>}
                      </div>
                    </div>
                  </div>

                  {/* DETAILED FEEDBACK */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-6">Detailed Feedback</h3>
                    <div className="space-y-4">
                      {match.detailedFeedback?.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-xl">
                          {statusIcon(item.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium">{item.area}</h4>
                              <span className={`text-xs capitalize font-medium ${statusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{item.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB: BULLET IMPROVER */}
          {activeTab === "improve" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-2">AI Resume Bullet Improver</h3>
                <p className="text-gray-400 text-sm mb-5">
                  Paste a resume bullet point and get actionable suggestions with examples.
                </p>
                <textarea
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  rows={4}
                  placeholder="e.g. Was responsible for managing the team and handling tasks..."
                  value={bullet}
                  onChange={(e) => setBullet(e.target.value)}
                />
                <button
                  onClick={improve}
                  disabled={bulletLoading || !bullet.trim()}
                  className="mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
                >
                  {bulletLoading ? (
                    <span className="flex items-center gap-2">
                      <FiRefreshCw className="animate-spin" size={18} />
                      Improving...
                    </span>
                  ) : (
                    "Improve Bullet"
                  )}
                </button>
              </div>

              {/* IMPROVED RESULT */}
              {improved && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* BEFORE / AFTER */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-3 text-gray-400 text-sm uppercase tracking-wider">Original</h3>
                      <p className="text-gray-300 italic">&ldquo;{improved.original}&rdquo;</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-3 text-indigo-300 text-sm uppercase tracking-wider">Improved Version</h3>
                      <p className="text-white">&ldquo;{improved.improvedVersion}&rdquo;</p>
                    </div>
                  </div>

                  {/* WHY BETTER */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-indigo-300">
                      <FiStar size={16} />
                      Why This Is Better
                    </h3>
                    <p className="text-gray-300">{improved.whyBetter}</p>
                  </div>

                  {/* ACTIONABLE STEPS */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <FiTrendingUp className="text-indigo-400" />
                      Actionable Steps
                    </h3>
                    <div className="space-y-4">
                      {improved.actionableSteps?.map((step, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                          <div className="flex items-start gap-3">
                            <span className="bg-indigo-500/20 text-indigo-300 rounded-full w-7 h-7 shrink-0 flex items-center justify-center text-sm font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <div>
                              <h4 className="font-medium mb-2">{step.step}</h4>
                              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <span className="text-gray-400 text-xs uppercase tracking-wider font-medium">Example</span>
                                <p className="text-gray-300 text-sm mt-1 italic">&ldquo;{step.example}&rdquo;</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIPS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-300">
                        <FiAlertCircle size={16} />
                        Pro Tips
                      </h3>
                      <ul className="space-y-2">
                        {improved.tips?.map((t, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-purple-300">
                        <FiStar size={16} />
                        Alternative Versions
                      </h3>
                      <ul className="space-y-3">
                        {improved.alternatives?.map((alt, i) => (
                          <li key={i} className="text-sm text-gray-300 bg-white/[0.03] rounded-lg p-3 italic">
                            &ldquo;{alt}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default UploadResume
