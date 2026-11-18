const fs = require("fs")
const pdf = require("pdf-parse/lib/pdf-parse")

const parseResume = async (input) => {
  // Accept either a file path (legacy) or an in-memory upload buffer.
  const dataBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input)

  const data = await pdf(dataBuffer)

  return data.text
}

module.exports = parseResume