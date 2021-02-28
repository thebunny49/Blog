var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
var passportLocal = require('passport-local');
const postModel = require('./post');
const multer = require('multer');
passport.use(new passportLocal(userModel.authenticate()));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var date = new Date();
    var filename = date.getTime() + file.originalname;
    cb(null, filename)
  }
})
 
var upload = multer({ storage: storage });


/* GET home page. */
router.get('/',redirectToProfile, function(req, res, next) {
  if(req.isAuthenticated()){
    res.render('index', { title: 'Travel Blog', loggedIn: 'true' });
  }
  else{
    res.render('index', { title: 'Travel Blog', loggedIn: 'false' });
  }
});

router.get('/login', function(req,res){
  res.render('login')
})

router.get('/main', function(req,res){
  res.render('main')
})


router.get('/register', function(req,res){
  res.render('register')
})
router.post('/register', function(req,res){
  var newuser = userModel({
    name: req.body.name ,
    username: req.body.username ,
    email: req.body.email ,
  })
  userModel.register(newuser, req.body.password)
  .then(function(registered){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/homepage');
    })
  })
})
router.get('/homepage',isLoggedIn, function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate('posts')
  .exec(function(err, data){
    res.render('homepage', {details: data})
  })
  
})

router.post('/login',passport.authenticate('local', {
  successRedirect: '/homepage',
  failureRedirect:'/'
}),function(req,res){})

router.get('/logout', function(req,res){
  req.logOut();
  res.redirect('/');
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error', 'You need to Login First!')
    res.redirect('/login')
  }
}
function redirectToProfile(req,res,next){
  if(req.isAuthenticated()){
    res.redirect('/main')
  }
  else{
    return next();
  }
}

router.get('/update/:username',isLoggedIn, function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    res.render('update',{details: foundUser});
  })
})

router.post('/update', function(req,res){
  userModel.findOneAndUpdate({username: req.session.passport.user},{
    name: req.body.name,
    email: req.body.email,
    username: req.body.username
  }, {new:true})
  .then(function(updated){
    res.redirect('/homepage');
  })
})
router.post('/upload',upload.single('img'), function(req,res){
  
  userModel.findOne({username: req.session.passport.user})
  .then(function(Founduser){
    Founduser.profileImage = `./images/uploads/${req.file.filename}`;
    Founduser.save()
    .then(function(done){
      req.flash('status', 'IMage Uploaded Suceessfully.');
      res.redirect('/homepage')
    })
  })
  
})

router.post('/posthere', function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      author: foundUser._id,
      post: req.body.post
    })
    .then(function(createpost){
      foundUser.posts.push(createpost);
      foundUser.save()
      .then(function(doneagain){
        res.redirect('/homepage')
      })
    })
  })
})
router.get("/randomPosts", function (req, res) {
  postModel.findRandom({}, {}, {
    limit: 3,
    populate: "author"
  }, function (err, results) {
    if (!err) {
      res.send(results); // 5 elements
    }
  });
});
module.exports = router;
