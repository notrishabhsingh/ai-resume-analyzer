import axios from "axios"
import { useState } from "react"
import { motion } from "framer-motion"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { FiUploadCloud } from "react-icons/fi"
import "react-circular-progressbar/dist/styles.css"

function UploadResume(){

const [analysis,setAnalysis] = useState(null)
const [resumeText,setResumeText] = useState("")
const [loading,setLoading] = useState(false)

const [jobDescription,setJobDescription] = useState("")
const [match,setMatch] = useState(null)

const [bullet,setBullet] = useState("")
const [improved,setImproved] = useState("")


/* UPLOAD RESUME */

const upload = async(e)=>{

const file = e.target.files[0]
if(!file) return

const formData = new FormData()
formData.append("resume",file)

setLoading(true)

const res = await axios.post(
"http://localhost:5000/api/resume/upload",
formData
)

setAnalysis(res.data.analysis)
setResumeText(res.data.resumeText)

setLoading(false)

}


/* JOB MATCH */

const checkMatch = async()=>{

const res = await axios.post(
"http://localhost:5000/api/resume/match",
{
resumeText,
jobDescription
}
)

setMatch(res.data)

}


/* BULLET IMPROVER */

const improve = async()=>{

const res = await axios.post(
"http://localhost:5000/api/resume/improve",
{ text: bullet }
)

setImproved(res.data.improved)

}



return(

<div className="w-full max-w-5xl mx-auto text-white">


{/* TITLE */}

<h1 className="text-5xl font-bold text-center mb-4">
AI Resume Analyzer
</h1>

<p className="text-center text-gray-300 mb-12">
Upload your resume and receive a detailed AI recruiter analysis
</p>



{/* BEAUTIFUL UPLOAD CARD */}

<motion.div
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.6}}
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-xl mb-12"
>

<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-400 rounded-2xl cursor-pointer hover:bg-white/10 transition">

<FiUploadCloud size={48} className="text-indigo-300 mb-3"/>

<span className="text-xl font-semibold">
Click to Upload Resume
</span>

<span className="text-gray-400 text-sm">
PDF files only
</span>

<input type="file" hidden onChange={upload}/>

</label>

</motion.div>



{loading && (

<p className="text-center text-indigo-300 animate-pulse mb-8">
AI is analyzing your resume...
</p>

)}



{analysis &&(

<div className="space-y-10">


{/* SCORE */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl text-center">

<h2 className="text-xl mb-6">Resume Score</h2>

<div className="w-40 mx-auto">

<CircularProgressbar
value={analysis.score}
text={`${analysis.score}/100`}
styles={buildStyles({
textColor:"#fff",
pathColor:"#8b5cf6",
trailColor:"#1f2937"
})}
/>

</div>

</div>



{/* SCORE BREAKDOWN */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Score Breakdown</h2>

<p>Content Quality: {analysis.scoreBreakdown.contentQuality}</p>
<p>ATS Compatibility: {analysis.scoreBreakdown.atsCompatibility}</p>
<p>Technical Skills: {analysis.scoreBreakdown.technicalSkills}</p>
<p>Experience Impact: {analysis.scoreBreakdown.experienceImpact}</p>

</div>



{/* STRENGTHS */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Strengths</h2>

<ul className="space-y-1">
{analysis.strengths.map((s,i)=>(
<li key={i}>• {s}</li>
))}
</ul>

</div>



{/* WEAKNESSES */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Weaknesses</h2>

<ul className="space-y-1">
{analysis.weaknesses.map((s,i)=>(
<li key={i}>• {s}</li>
))}
</ul>

</div>



{/* SKILLS */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Detected Skills</h2>

<div className="flex flex-wrap gap-2">

{analysis.skills.map((s,i)=>(

<span key={i} className="px-3 py-1 bg-purple-500/20 rounded-lg text-sm">
{s}
</span>

))}

</div>

</div>



{/* IMPROVEMENTS */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Suggested Improvements</h2>

<ul className="space-y-1">

{analysis.improvements.map((s,i)=>(

<li key={i}>• {s}</li>

))}

</ul>

</div>



{/* FULL ANALYSIS */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Detailed Analysis</h2>

<p className="text-gray-300 leading-relaxed">
{analysis.fullAnalysis}
</p>

</div>



{/* JOB MATCH */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">Job Description Match</h2>

<textarea
className="w-full p-3 rounded text-black"
placeholder="Paste job description..."
onChange={(e)=>setJobDescription(e.target.value)}
/>

<button
onClick={checkMatch}
className="mt-4 px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition"
>
Analyze Match
</button>


{match &&(

<div className="mt-4">

<p>Match Score: {match.matchScore}%</p>

<p className="mt-2 font-semibold">Matching Skills</p>

<ul>
{match.matchingSkills.map((s,i)=>(
<li key={i}>{s}</li>
))}
</ul>

<p className="mt-2 font-semibold">Missing Skills</p>

<ul>
{match.missingSkills.map((s,i)=>(
<li key={i}>{s}</li>
))}
</ul>

</div>

)}

</div>



{/* BULLET IMPROVER */}

<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-xl">

<h2 className="text-xl mb-4">AI Resume Bullet Improver</h2>

<textarea
className="w-full p-3 rounded text-black"
placeholder="Paste resume bullet..."
onChange={(e)=>setBullet(e.target.value)}
/>

<button
onClick={improve}
className="mt-4 px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600 transition"
>
Improve Bullet
</button>

{improved &&(

<p className="mt-4 text-gray-300">
{improved}
</p>

)}

</div>



</div>

)}

</div>

)

}

export default UploadResume