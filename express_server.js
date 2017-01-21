const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Middleware

// Handles body (of forms submitted);
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Handles cookies
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  secret: 'SuperSecureSecret'
}))

// Encyrpts cookies
const bcrypt = require('bcrypt');

// Static files
app.use(express.static(__dirname + '/public'));

// Globals
const users = {
  "userId": {
    id: "userId",
    email: "user@example.com",
    password: bcrypt.hashSync('password', 10)},
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    createdBy: 'userId'},
  '9sm5xK': {
    longURL: "http://www.google.com",
    createdBy: 'userId'}
};

// Generate random number for Id's
const generateRandomNumber = () => {
  return Math.floor((Math.random()) * 1e10).toString(32);
}

// Registeration email exists checker
const regChecker = (email, password) => {
  if (password === undefined) {
    for (randId in users) {
      if (users[randId].email === email){
        return true;
      };
    } return false;
  };
};

// This checks if the current userid (from the cookie) matches with the database
const userChecker = (currentUser) => {
  for (let user in users) {
    if (user === currentUser) {
      return true;
    }
  } return false;
}
// ------------------------ GET ENDPOINTS ------------------------

// Root Page
app.get("/", (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.session.user_id]};
  if (userChecker(req.session.user_id)) {
    res.render('urls_index', templateVars);
  } else {
    res.render('index', templateVars);
  }
});

// Main Page
app.get('/urls', (req,res) => {
  if (userChecker(req.session.user_id)) {
    let customLinks = {}
    for (let link in urlDatabase){
      if (urlDatabase[link].createdBy === req.session.user_id){
        customLinks[link] = urlDatabase[link];
      };
    };
    let templateVars = {
      url: customLinks,
      username: users[req.session.user_id]
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send({error: '401: You are not authorized'});
  }
});

// This is the short link that redirects to long url
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL].longURL) {
    res.status(404).send({error: '404: Not found'});
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);   // TODO: JH suspects a bug here
});


// Registration Page
app.get('/register', (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.session.user_id};
  res.render('register');
})

// ------------------------ POST ------------------------

// Delete url
app.post("/urls/:id/delete", (req, res) => {
  if (userChecker(req.session.user_id)) {
    delete urlDatabase[req.params.id]
    res.redirect('/urls');
  } else {
    res.status(403).send({error: '403: You are not allowed to delete this'})
  };
});

// Create URL
app.post("/urls", (req, res) => {
  if (userChecker(req.session.user_id)) {
      let newID = generateRandomNumber()
      urlDatabase[newID] = {
        longURL: req.body.longURL,
        createdBy: req.session.user_id
      },
      res.redirect('/urls');
  } else {res.status(403).send({error: 'Please Log In'})};
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  if (userChecker(req.session.user_id)) {
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      createdBy: req.session.user_id
    },
    res.redirect('/urls')
  } else {res.status(401).send({error: 'Please Log In'})};
});

// Login
app.post("/login", (req, res) => {
  // email-password checker
  for (user in users) {
    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
      return;
    };
  };
  res.status(401).send({error: 'User and Password do not match'});
});

// Logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/');
});

// Register
app.post('/register', (req, res) => {
  // checks if email or password is empty
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send({error: 'Email or password empty'});
  } // checks if email is in database
  else if (regChecker(req.body.email)) {
    res.status(400).send({ error: 'Email already in database'});
  } else {
    // generates a new id and assigns it into database
    let newUserId = generateRandomNumber();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newUserId;
    res.redirect('/urls');
  };
});

// This is where the magic begins
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
