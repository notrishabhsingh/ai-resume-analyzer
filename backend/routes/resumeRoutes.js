const express = require("express")
const router = express.Router()
const multer = require("multer")

const parseResume = require("../services/parserService")

const {
 analyzeResume,
 matchResumeToJob,
 improveBullet
} = require("../services/aiService")


const upload = multer({
 dest:"uploads/"
})



/* -------------------------------- */
/* UPLOAD + ANALYZE RESUME */
/* -------------------------------- */

router.post("/upload", upload.single("resume"), async (req,res)=>{

 try{

  console.log("Upload request received")

  if(!req.file){
   return res.status(400).json({error:"No file uploaded"})
  }

  const filePath = req.file.path

  console.log("File uploaded:",filePath)

  const resumeText = await parseResume(filePath)

  console.log("Resume parsed successfully")

  const analysis = await analyzeResume(resumeText)

  console.log("AI analysis completed")

  res.json({
   analysis,
   resumeText
  })

 }catch(error){

  console.error("Resume analysis error:",error)

  res.status(500).json({
   error:"resume analysis failed"
  })

 }

})



/* -------------------------------- */
/* JOB MATCH */
/* -------------------------------- */

router.post("/match", async(req,res)=>{

 try{

  const {resumeText, jobDescription} = req.body

  const result = await matchResumeToJob(resumeText, jobDescription)

  res.json(result)

 }catch(err){

  console.error(err)

  res.status(500).json({
   error:"job match failed"
  })

 }

})



/* -------------------------------- */
/* IMPROVE RESUME BULLET */
/* -------------------------------- */

router.post("/improve", async(req,res)=>{

 try{

  const {text} = req.body

  const improved = await improveBullet(text)

  res.json({
   improved
  })

 }catch(err){

  console.error(err)

  res.status(500).json({
   error:"bullet improvement failed"
  })

 }

})



module.exports = router