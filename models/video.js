const mongoose = require('mongoose')
const marked = require('marked')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const videoSchema = new mongoose.Schema({
  category: {
    type: String,
  },
  title: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    required: true
  },
})

module.exports = mongoose.model('Video', videoSchema)