const mongoose = require('mongoose')

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
    type: String
  },
})

module.exports = mongoose.model('Video', videoSchema)