const express = require('express')
const mongoose = require('mongoose')
const Article = require('./models/article')
const Category = require('./models/category')
const Video = require('./models/video')
const Insta = require('./models/insta')
const articleRouter = require('./routes/articles')
const bodyParser = require("body-parser")
const methodOverride = require('method-override')
const app = express()
const multer  = require('multer')
const fs = require('fs')
const dotenv = require("dotenv")


dotenv.config()

// Connecting to Database
mongoose.connect(process.env.DATABASE,{
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})


app.set('view engine', 'ejs')
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

// Setting up directory for storing images
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
  cb(null, './public/uploads/')
  },
  filename: function(req, file, cb) {
  cb(null, new Date().toLocaleTimeString() + '-' + file.originalname);
  }
 });
  
 var upload = multer({
  storage: storage
 });

// Home Page
app.get('/',async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  const categories = await Category.find()
  const video = await Video.find()
  const insta = await Insta.find()
  res.render('home' , {articles: articles, categories: categories, videos: video, insta: insta})
})

// About Page
app.get('/about',async (req, res) => {
  res.render('about')
})

// Contact Page
app.get('/contact',async (req, res) => {
  res.render('contact')
})

// Search Results
app.post('/search', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  const categories = await Category.find()
  const query = req.body.search.toLowerCase()
  const count = 0
  res.render('search' , {articles: articles, query: query, count: count, categories: categories})
})

// Storing Images to directory
app.post('/profile', upload.single('avatar'), async function (req, res, next) {

  // removing 'public' from path because images do not load in ejs file
 const path = req.file.path.replace('public','');
 
 const id = req.body.id
 let article = await Article.findById(id)
 // Adding 'public' to path to remove images 
//  in case they are replaced from admin panel
 const append = './public'
 const appended = append.concat(article.path)

 // Deleting old file in case of replace
 fs.unlink(appended, (err) => {
  if (err) {
    console.error(err)
    return
  }

  //file removed
})

// Storing article image path to database
 article.path = path
 try {
  article = await article.save()
  res.redirect('back');
} catch (e) {
  console.log(e);
}
})


// Storing Banner to directory
app.post('/banner', upload.single('banner'), async function (req, res, next) {

  // removing 'public' from path because images do not load in ejs file
 const path = req.file.path.replace('public','');
 
 const id = req.body.id
 let categories = await Category.findById(id)
 //Adding 'public' to path to remove images 
// in case they are replaced from admin panel
 const append = './public'
 const appended = append.concat(categories.catimg)

// Deleting old file in case of replace
 fs.unlink(appended, (err) => {
  if (err) {
    console.error(err)
    return
  }
  //file removed
})

// Storing category banner path to database
 categories.catimg = path
 try {
  categories = await categories.save()
  res.redirect('back');
} catch (e) {
  console.log(e);
}
})


// Posting comments
app.post('/comments', async function (req, res, next) {
  const id = req.body.id
  let article = await Article.findById(id)
  const comments = {
    name: req.body.name,
    email: req.body.mail,
    comment: req.body.comment,
    date: new Date().toJSON().slice(0,10).replace(/-/g,'/')
  }
  article.comments = article.comments.concat(comments)
  
  try {
   article = await article.save()
   res.redirect('back');
 } catch (e) {
   console.log(e);
 }
 })

// Redirecting links to admin panel
app.get('/all', async (req, res) => {
  res.redirect('articles/all')
})

app.get('/category', async (req, res) => {
  res.redirect('articles/category')
})

app.get('/video', async (req, res) => {
  res.redirect('articles/video')
})

app.get('/insta', async (req, res) => {
  res.redirect('articles/insta')
})


app.use('/articles', articleRouter)


// For error page
app.get("*",function(req,res)
	{
		res.render("error.ejs");
	});

console.log("server has started...")
const port = process.env.PORT || 4000
app.listen(port)

