const parser = require("../services/parserService")
const ai = require("../services/aiService")
const Resume = require("../models/Resume")

exports.uploadResume = async(req,res)=>{

 const text = await parser.extractText(req.file.path)

 const analysis = await ai.analyzeResume(text)

 const saved = await Resume.create({
  resumeText:text,
  score:80
 })

 res.json({
  analysis,
  saved
 })

}