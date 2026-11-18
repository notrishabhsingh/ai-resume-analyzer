const mongoose = require("mongoose")

const connectDB = async () => {

 try {

  await mongoose.connect(process.env.MONGO_URI, {
   serverSelectionTimeoutMS: 10000
  })

  console.log("MongoDB Connected")

 } catch (error) {

  // Do not kill the server: none of the API routes depend on the DB yet,
  // and exiting here makes Render mark the whole deploy as failed.
  console.error("MongoDB connection failed (server will keep running):", error.message)

 }

}

module.exports = connectDB