const mongoose = require('mongoose')
const slugify = require('slugify')

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
  },
  catimg: {
    type: String
  },
  counter: {
    type: Number,
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
})

categorySchema.pre('validate', function (next) {
  if (this.category) {
    this.slug = slugify(this.category, { lower: true, strict: true })
  }
  next()
})

module.exports = mongoose.model('Category', categorySchema)