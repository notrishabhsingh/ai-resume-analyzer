const express = require("express")
const cors = require("cors")
require("dotenv").config()

const connectDB = require("./utils/db")
const resumeRoutes = require("./routes/resumeRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Connect in the background so a DB problem never blocks the HTTP server
// from starting (Render fails the deploy if the port is not opened in time).
connectDB()

app.use(cors())
app.use(express.json())

app.use("/api/resume", resumeRoutes)

app.get("/", (req,res)=>{
  res.send("AI Resume Analyzer API running")
})

app.listen(PORT, "0.0.0.0", ()=>{
  console.log(`Server running on port ${PORT}`)
})