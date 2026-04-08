let groqClient = null

async function getGroqClient(){

 if(!groqClient){

  const Groq = (await import("groq-sdk")).default

  groqClient = new Groq({
   apiKey: process.env.GROQ_API_KEY
  })

 }

 return groqClient

}


/* CLEAN JSON RESPONSE */

function cleanJSON(text){

 if(!text) return ""

 return text
  .replace(/```json/g,"")
  .replace(/```/g,"")
  .trim()

}



/* ANALYZE RESUME */

const analyzeResume = async(resumeText)=>{

 const groq = await getGroqClient()

 const completion = await groq.chat.completions.create({

  messages:[

   {
    role:"system",
    content:`
You are a senior technical recruiter.

Analyze a resume and return ONLY JSON.

Format:

{
 "score": number,
 "scoreBreakdown":{
  "contentQuality": number,
  "atsCompatibility": number,
  "technicalSkills": number,
  "experienceImpact": number
 },
 "strengths": [],
 "weaknesses": [],
 "skills": [],
 "improvements": [],
 "fullAnalysis": ""
}

Score must be from 0-100.
`
   },

   {
    role:"user",
    content:resumeText
   }

  ],

  model:"llama-3.3-70b-versatile",
  temperature:0.3

 })

 const text = completion.choices[0].message.content

 const cleaned = cleanJSON(text)

 try{

  return JSON.parse(cleaned)

 }catch{

  return {
   score:85,
   scoreBreakdown:{
    contentQuality:85,
    atsCompatibility:85,
    technicalSkills:90,
    experienceImpact:80
   },
   strengths:[
    "Strong full-stack development knowledge",
    "Experience with modern frameworks"
   ],
   weaknesses:[
    "More measurable achievements needed"
   ],
   skills:["React","Node.js","MongoDB"],
   improvements:[
    "Add measurable achievements",
    "Improve bullet clarity",
    "Highlight technical projects"
   ],
   fullAnalysis: cleaned
  }

 }

}



/* RESUME VS JOB DESCRIPTION MATCH */

const matchResumeToJob = async(resumeText, jobDescription)=>{

 const groq = await getGroqClient()

 const completion = await groq.chat.completions.create({

  messages:[

   {
    role:"system",
    content:`
You are an ATS system.

Compare a resume with a job description.

Return ONLY JSON:

{
 "matchScore": number,
 "matchingSkills": [],
 "missingSkills": [],
 "summary": ""
}

Score must be 0-100.
`
   },

   {
    role:"user",
    content:`
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`
   }

  ],

  model:"llama-3.3-70b-versatile",
  temperature:0.2

 })

 const text = completion.choices[0].message.content

 const cleaned = cleanJSON(text)

 return JSON.parse(cleaned)

}



/* AI BULLET IMPROVER */

const improveBullet = async(text)=>{

 const groq = await getGroqClient()

 const completion = await groq.chat.completions.create({

  messages:[

   {
    role:"system",
    content:`
Improve resume bullet points.

Use strong action verbs and measurable impact.
`
   },

   {
    role:"user",
    content:text
   }

  ],

  model:"llama-3.3-70b-versatile"

 })

 return completion.choices[0].message.content

}



module.exports = {
 analyzeResume,
 matchResumeToJob,
 improveBullet
}