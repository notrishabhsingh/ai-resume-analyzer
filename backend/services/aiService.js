let groqClient = null

async function getGroqClient() {
  if (!groqClient) {
    const Groq = (await import("groq-sdk")).default
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

function cleanJSON(text) {
  if (!text) return ""
  return text.replace(/```json/g, "").replace(/```/g, "").trim()
}

const analyzeResume = async (resumeText) => {
  const groq = await getGroqClient()

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a senior technical recruiter and ATS expert.

Analyze the provided text. First determine if it is a resume/CV.

If it IS a resume, return ONLY valid JSON in this exact format:
{
  "isResume": true,
  "score": <0-100>,
  "scoreBreakdown": {
    "contentQuality": <0-100>,
    "atsCompatibility": <0-100>,
    "technicalSkills": <0-100>,
    "experienceImpact": <0-100>
  },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "skills": ["...", "..."],
  "improvements": ["...", "..."],
  "detailedAnalysis": [
    {"point": "Overall Structure & Formatting", "details": "..."},
    {"point": "Contact Information", "details": "..."},
    {"point": "Professional Summary", "details": "..."},
    {"point": "Work Experience Depth", "details": "..."},
    {"point": "Education Section", "details": "..."},
    {"point": "Skills Presentation", "details": "..."},
    {"point": "Action Verbs & Achievements", "details": "..."},
    {"point": "Quantifiable Metrics", "details": "..."},
    {"point": "ATS Keyword Optimization", "details": "..."},
    {"point": "Length & Conciseness", "details": "..."},
    {"point": "Grammar & Professionalism", "details": "..."},
    {"point": "Target Role Alignment", "details": "..."}
  ]
}

If it is NOT a resume, return:
{
  "isResume": false,
  "error": "clear explanation of why"
}

The detailedAnalysis must contain exactly 10-12 points with specific, actionable feedback.`
      },
      {
        role: "user",
        content: resumeText
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3
  })

  const text = completion.choices[0].message.content
  const cleaned = cleanJSON(text)

  try {
    const parsed = JSON.parse(cleaned)
    if (!parsed.isResume) return parsed
    const analysis = parsed.detailedAnalysis
    if (!analysis || analysis.length < 10) {
      const dummy = []
      const topics = [
        "Overall Structure & Formatting", "Contact Information", "Professional Summary",
        "Work Experience Depth", "Education Section", "Skills Presentation",
        "Action Verbs & Achievements", "Quantifiable Metrics", "ATS Keyword Optimization",
        "Length & Conciseness", "Grammar & Professionalism", "Target Role Alignment"
      ]
      for (let i = 0; i < topics.length; i++) {
        dummy.push({
          point: topics[i],
          details: analysis?.[i]?.details || "Needs improvement in this area."
        })
      }
      parsed.detailedAnalysis = dummy
    }
    return parsed
  } catch {
    return {
      isResume: false,
      error: "We couldn't analyze this document. Please upload a valid resume in PDF format."
    }
  }
}

const matchResumeToJob = async (resumeText, jobDescription) => {
  const groq = await getGroqClient()

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert ATS system and hiring manager.

Compare the RESUME with the JOB DESCRIPTION. Return ONLY valid JSON:

{
  "matchScore": <0-100>,
  "categoryScores": {
    "skills": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "overallFit": <0-100>
  },
  "matchingSkills": ["...", "..."],
  "missingSkills": ["...", "..."],
  "suggestedSkills": ["...", "..."],
  "overallVerdict": "2-3 sentence summary of fit",
  "detailedFeedback": [
    {"area": "Technical Skills", "status": "good|needs-improvement|missing", "comment": "..."},
    {"area": "Experience Relevance", ...},
    {"area": "Education", ...},
    {"area": "Soft Skills", ...},
    {"area": "Industry Knowledge", ...},
    {"area": "Certifications", ...},
    {"area": "Project Experience", ...}
  ]
}`
      },
      {
        role: "user",
        content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2
  })

  const text = completion.choices[0].message.content
  const cleaned = cleanJSON(text)

  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      matchScore: 0,
      categoryScores: { skills: 0, experience: 0, education: 0, overallFit: 0 },
      matchingSkills: [],
      missingSkills: [],
      suggestedSkills: [],
      overallVerdict: "Could not analyze match. Please try again.",
      detailedFeedback: []
    }
  }
}

const improveBullet = async (bulletText) => {
  const groq = await getGroqClient()

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a professional resume writer and career coach.

Given a resume bullet point, provide structured feedback. Return ONLY valid JSON:

{
  "original": "...",
  "improvedVersion": "rewritten version with strong action verbs and measurable impact",
  "whyBetter": "2-3 sentence explanation",
  "actionableSteps": [
    {"step": "Use stronger action verbs", "example": "Replace 'Was responsible for' with 'Led' or 'Delivered'"},
    {"step": "...", "example": "..."},
    {"step": "...", "example": "..."},
    {"step": "...", "example": "..."}
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "alternatives": ["alt version 1", "alt version 2"]
}

Include 3-5 actionable steps with concrete examples.`
      },
      {
        role: "user",
        content: bulletText
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3
  })

  const response = completion.choices[0].message.content
  const cleaned = cleanJSON(response)

  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      original: bulletText,
      improvedVersion: bulletText,
      whyBetter: "Could not generate improvement. Please try again.",
      actionableSteps: [],
      tips: [],
      alternatives: []
    }
  }
}

module.exports = { analyzeResume, matchResumeToJob, improveBullet }
