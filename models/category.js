const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
  },
  catimg: {
    type: String
  },
  count: {
    type: Number
  }
})

module.exports = mongoose.model('Category', categorySchema)