const mongoose = require("mongoose")

const ResumeSchema = new mongoose.Schema({

 resumeText: String,

 score: Number,

 suggestions: [String],

 skills: [String],

 createdAt: {
  type: Date,
  default: Date.now
 }

})

module.exports = mongoose.model("Resume", ResumeSchema)