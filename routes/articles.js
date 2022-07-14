const express = require('express')
const mongoose = require('mongoose')
const Article = require('./../models/article')
const Category = require('./../models/category')
const Video = require('./../models/video')
const Insta = require('./../models/insta')
const Contact = require('./../models/contact')
const fs = require('fs')
const router = express.Router(),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  User = require('./../models/users'),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

router.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('useFindAndModify', false);
// for authentication
router.use(require("express-session")({
  secret: "type anything here",
  resave: false,
  saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// register page
router.get("/register", function (req, res) {
  res.render("register");
});


//Signing Up Code
router.post("/register", function (req, res) {
  req.body.pname
  req.body.password
  User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/articles/all");
    });
  });
});

//Login Routes
router.get("/login", function (req, res) {
  res.render("login");
});

// Checking credentials
router.post("/login", passport.authenticate("local", {
  successRedirect: "/articles/all",
  failureRedirect: "/articles/login"
}), function (req, res) {

});

// Logout  
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/articles/login');
  });
});

// Checking if user is logged in 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/articles/login");
}
// Displaying Instagram Post
router.get('/insta', isLoggedIn, async (req, res) => {
  const insta = await Insta.find()
  res.render('insta/insta-post', { insta: insta })
})

// Adding New Instagram Post
router.get('/insta/new', isLoggedIn, async (req, res) => {
  res.render('insta/new-post')
})

router.post('/insta/new', isLoggedIn, async (req, res) => {
  let insta = await new Insta
  insta.post = req.body.post
  try {
    insta = await insta.save()
    res.redirect('/articles/insta');
  } catch (e) {
    console.log(e);
  }
})

// Editing Instagram Post
router.get('/insta/edit/:id', isLoggedIn, async (req, res) => {
  const insta = await Insta.findById(req.params.id)
  res.render('insta/edit-post', { insta: insta })
})

router.post('/insta/edit/:id', isLoggedIn, async (req, res) => {
  let insta = await Insta.findById(req.params.id)
  insta.post = req.body.post
  try {
    insta = await insta.save()
    res.redirect('/articles/insta');
  } catch (e) {
    console.log(e);
  }
})


// Displaying all Categories
router.get('/category', isLoggedIn, async (req, res) => {
  const categories = await Category.find()
  res.render('category/category', { category: categories })
})

// Adding New Category
router.get('/category/new', isLoggedIn, async (req, res) => {
  res.render('category/new-category')
})

router.post('/category/new', isLoggedIn, async (req, res) => {
  let categories = await new Category
  categories.category = req.body.category.toLowerCase()
  try {
    categories = await categories.save()
    res.redirect('/articles/category');
  } catch (e) {
    console.log(e);
  }
})


// Editing Category
router.get('/category/edit/:id', isLoggedIn, async (req, res) => {
  const categories = await Category.findById(req.params.id)
  res.render('category/edit-category', { category: categories })
})

router.post('/category/edit/:id', isLoggedIn, async (req, res) => {
  let categories = await Category.findById(req.params.id)
  categories.category = req.body.category.toLowerCase()
  try {
    categories = await categories.save()
    res.redirect('/articles/category');
  } catch (e) {
    console.log(e);
  }
})

// Deleting category
router.delete('/category/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id
  const categories = await Category.findById(id)
  const path = categories.catimg
  console.log(path)
  await Category.findByIdAndDelete(id)
  res.redirect('/articles/category')
  deletebanner(path)
})

// Deleting banners related to deleted category
function deletebanner(path) {
  const append = './public'
  const appended = append.concat(path)
  fs.unlink(appended, (err) => {
    if (err) {
      console.error(err)
      return
    }
    //file removed
  })
}

// Displaying all Videos
router.get('/video', isLoggedIn, async (req, res) => {
  const video = await Video.find()
  res.render('videos/video', { videos: video })
})

// Adding New Video
router.get('/video/new', isLoggedIn, async (req, res) => {
  const categories = await Category.find()
  res.render('videos/new-video', { categories: categories })
})

router.post('/video/new', isLoggedIn, async (req, res) => {
  let video = await new Video
  video.title = req.body.title
  video.source = req.body.source
  video.category = req.body.category.toLowerCase()
  Category.findOneAndUpdate({ category: video.category }, { $inc: { 'counter': 1 } }).exec()
  try {
    video = await video.save()
    res.redirect('/articles/video');
  } catch (e) {
    console.log(e);
  }
})

// Editing Video
router.get('/video/edit/:id', isLoggedIn, async (req, res) => {
  const categories = await Category.find()
  const video = await Video.findById(req.params.id)
  res.render('videos/edit-video', { videos: video, categories: categories })
})

router.post('/video/edit/:id', isLoggedIn, async (req, res) => {
  let video = await Video.findById(req.params.id)
  video.title = req.body.title
  video.source = req.body.source
  let cat = video.category
  video.category = req.body.category.toLowerCase()
  if (cat !== video.category) {
    Category.findOneAndUpdate({ category: cat }, { $inc: { 'counter': -1 } }).exec()
    Category.findOneAndUpdate({ category: video.category }, { $inc: { 'counter': 1 } }).exec()

  }
  try {
    video = await video.save()
    res.redirect('/articles/video');
  } catch (e) {
    console.log(e);
  }
})

// Deleting video
router.delete('/video/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id
  const video = await Video.findById(id)
  const cat = video.category
  await Video.findByIdAndDelete(id)
  Category.findOneAndUpdate({ category: cat }, { $inc: { 'counter': -1 } }).exec()
  res.redirect('/articles/video')
})


// Fetching all posts in admin panel
router.get('/all', isLoggedIn, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

// Fetching new post form
router.get('/new', isLoggedIn, async (req, res) => {
  const categories = await Category.find()
  let val = "unchecked"
  let val1 = "unchecked"
  let val2 = "unchecked"
  res.render('articles/new', { article: new Article(), categories: categories, val: val, val1: val1, val2: val2 })
})

// Editing Post
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const article = await Article.findById(req.params.id)
  const categories = await Category.find()
  let val = "unchecked"
  let val1 = "unchecked"
  let val2 = "unchecked"
  const aid = req.params.id
  res.render('articles/edit', { article: article, aid: aid, categories: categories, val: val, val1: val1, val2: val2 })
})

// router.get('/:slug', async (req, res) => {
//   const article = await Article.findOne({ slug: req.params.slug })
//   if (article == null) res.redirect('/')
//   res.render('articles/show', { article: article })
// })

// Rendering a particular post 
router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  const articles = await Article.find()
  const categories = await Category.find()
  const insta = await Insta.find()
  if (article == null) res.redirect('/')
  const comments = article.comments
  res.render('single-post', { articles: articles, comments: comments, categories: categories, article: article, insta: insta })
})

// Saving new post
router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

// Finding post for a particular id and editing
router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

// Deleting post
router.delete('/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id
  const article = await Article.findById(id)
  const path = article.path
  const categ = article.category
  await Article.findByIdAndDelete(id)
  res.redirect('/all')
  deletefile(path, categ)
})

// Deleting files and category counter related to deleted post
function deletefile(path, categ) {
  Category.findOneAndUpdate({ category: categ }, { $inc: { 'counter': -1 } }).exec()
  const append = './public'
  const appended = append.concat(path)
  fs.unlink(appended, (err) => {
    if (err) {
      console.error(err)
      return
    }
    //file removed
  })
}


// Save Function
function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    const cat = article.category
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.trending = req.body.trending
    article.homepage = req.body.homepage
    article.category = req.body.category
    article.source = req.body.source
    let words = req.body.key.toLowerCase()
    // Saving keywords
    let kw = words.split(',')
    article.keywords = kw
    if (cat !== article.category) {
      Category.findOneAndUpdate({ category: cat }, { $inc: { 'counter': -1 } }).exec()
      Category.findOneAndUpdate({ category: article.category }, { $inc: { 'counter': 1 } }).exec()

    }
    try {
      article = await article.save()
      // res.redirect(`/articles/${article.slug}`)
      res.redirect('/all')
    } catch (e) {
      // res.render(`articles/${path}`, { article: article })
      console.log(e)
    }
  }
}

// Displaying all Contact Queries
router.get('/contact/all', isLoggedIn, async (req, res) => {
  const contacts = await Contact.find()
  res.render('contact/all-queries', { contacts: contacts })
})

// Adding New Contact Entry
router.post('/contact/new', isLoggedIn, async (req, res) => {
  let contact = await new Contact
  contact.name = req.body.name
  contact.email = req.body.email
  contact.subject = req.body.subject
  contact.message = req.body.message
  try {
    contact = await contact.save()
    res.redirect('/contact-us');
  } catch (e) {
    console.log(e);
  }
})


// Deleting Contact Entry
router.delete('/contact/:id', isLoggedIn, async (req, res) => {
  const id = req.params.id
  await Contact.findByIdAndDelete(id)
  res.redirect('/articles/contact/all')
})


// Filters
router.get('/single/:type', isLoggedIn, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  const categories = await Category.find()
  const video = await Video.find()
  const insta = await Insta.find()
  const type = req.params.type
  res.render('filter' , {articles: articles, categories: categories, videos: video, insta: insta, type: type})
})

// Error Page
router.get("/articles/*", function (req, res) {
  res.render("error.ejs");
});

module.exports = router