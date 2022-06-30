const express = require('express')
const Article = require('./../models/article')
const router = express.Router(),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  User = require('./../models/users'),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

router.use(bodyParser.urlencoded({ extended: true }));

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
router.get("/register",function(req,res)
	{
		res.render("register");
	});


//Signing Up Code
router.post("/register",function(req,res)
	{	
		req.body.pname
		req.body.password
		User.register(new User({username: req.body.username}), req.body.password, function(err,user)
			{
				if(err)
				{
					console.log(err);
					return res.render("register");
				}
				   passport.authenticate("local")(req,res,function()
				{
 					res.redirect("/articles/all");
				});
			});
	});

//Login Routes
router.get("/login",function(req,res)
	{
		res.render("login");
	});

// Checking credentials
router.post("/login", passport.authenticate("local" ,{
		successRedirect: "/articles/all",
		failureRedirect: "/articles/login"
}),function(req,res)
	{

	});

// Logout  
router.get("/logout",function(req,res, next)
{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/articles/login');
      });
	});

// Checking if user is logged in 
function isLoggedIn(req,res,next)
{
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/articles/login");
}

// Fetching all posts in admin panel
router.get('/all', isLoggedIn, async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})

// Fetching new post form
router.get('/new', isLoggedIn, (req, res) => {
  res.render('articles/new', { article: new Article() })
})

// Editing Post
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const article = await Article.findById(req.params.id)
  const aid = req.params.id
  res.render('articles/edit', { article: article, aid: aid })
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

// Finding article for a particular id
router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

// Deleting post
router.delete('/:id', isLoggedIn, async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/all')
})


// Save Function
function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.latest = req.body.latest
    let words = req.body.key.toLowerCase()
// Saving keywords
    let kw = words.split(',')
    article.keywords = kw
    try {
      article = await article.save()
      // res.redirect(`/articles/${article.slug}`)
      res.redirect('/all')
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

// Error Page
router.get("/articles/*",function(req,res)
	{
		res.render("error.ejs");
	});

module.exports = router