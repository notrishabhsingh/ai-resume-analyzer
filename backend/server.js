const express = require("express")
const cors = require("cors")
require("dotenv").config()

const connectDB = require("./utils/db")
const resumeRoutes = require("./routes/resumeRoutes")

const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.use("/api/resume", resumeRoutes)

app.get("/", (req,res)=>{
  res.send("AI Resume Analyzer API running")
})

app.listen(5000, ()=>{
  console.log("Server running on port 5000")
})