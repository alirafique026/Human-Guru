const mongoose = require('mongoose')
const marked = require('marked')
const createDomPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const instaSchema = new mongoose.Schema({

  post: {
    type: String,
    required: true
  },
})



module.exports = mongoose.model('Insta', instaSchema)