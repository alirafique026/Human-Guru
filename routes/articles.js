const express = require('express')
const mongoose = require('mongoose')
const Article = require('./../models/article')
const Category = require('./../models/category')
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



// Fetching all posts in admin panel
router.get('/all', isLoggedIn, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

// Fetching new post form
router.get('/new', isLoggedIn, async (req, res) => {
  const categories = await Category.find()
  let val = "unchecked"
  res.render('articles/new', { article: new Article(), categories: categories, val: val })
})

// Editing Post
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const article = await Article.findById(req.params.id)
  const categories = await Category.find()
  let val = "unchecked"
  const aid = req.params.id
  res.render('articles/edit', { article: article, aid: aid, categories: categories, val: val })
})

// router.get('/:slug', async (req, res) => {
//   const article = await Article.findOne({ slug: req.params.slug })
//   if (article == null) res.redirect('/')
//   res.render('articles/show', { article: article })
// })

// Rendering a particular post 
router.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  const comments = article.comments
  res.render('single-post', { article: article, comments: comments })
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
  deletefile(path,categ)
})

// Deleting files and category counter related to deleted post
function deletefile(path,categ) {
  Category.findOneAndUpdate({category: categ}, { $inc: {'counter': -1 }}).exec()
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
    article.category = req.body.category
    let words = req.body.key.toLowerCase()
    // Saving keywords
    let kw = words.split(',')
    article.keywords = kw
    if(cat !== article.category)
    {
      Category.findOneAndUpdate({category: cat}, { $inc: {'counter': -1 }}).exec()
      Category.findOneAndUpdate({category: article.category}, { $inc: {'counter': 1 }}).exec()

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

// Error Page
router.get("/articles/*", function (req, res) {
  res.render("error.ejs");
});

module.exports = router