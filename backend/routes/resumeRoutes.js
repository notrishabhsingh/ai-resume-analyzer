const express = require("express")
const router = express.Router()
const multer = require("multer")

const parseResume = require("../services/parserService")

const {
  analyzeResume,
  matchResumeToJob,
  improveBullet
} = require("../services/aiService")

const upload = multer({ dest: "uploads/" })

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const resumeText = await parseResume(req.file.path)
    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        isResume: false,
        error: "The uploaded file appears to be empty or unreadable. Please upload a valid PDF resume."
      })
    }

    const analysis = await analyzeResume(resumeText)

    res.json({ analysis, resumeText })
  } catch (error) {
    console.error("Resume analysis error:", error)
    res.status(500).json({
      isResume: false,
      error: "Resume analysis failed. Please try again."
    })
  }
})

router.post("/match", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        error: "Both resume text and job description are required."
      })
    }

    const result = await matchResumeToJob(resumeText, jobDescription)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Job match analysis failed." })
  }
})

router.post("/improve", async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "No bullet text provided." })
    }

    const improved = await improveBullet(text)
    res.json(improved)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Bullet improvement failed." })
  }
})

module.exports = router
