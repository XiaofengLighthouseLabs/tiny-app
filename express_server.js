const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')


const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  secret: 'SuperSecureSecret'
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

// app.use(cookieParser())


// Globals
const users = {
  "user1Id": {
    id: "user1Id",
    email: "user@example.com",
    password: bcrypt.hashSync('password', 10)},
  'user2Id': {
    id: 'user2Id',
    email: 'user2@example.com',
    password: bcrypt.hashSync('password', 10)}
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    createdBy: 'user1Id'},
  '9sm5xK': {
    longURL: "http://www.google.com",
    createdBy: 'user1Id'}
};

// Generate random number for Id's
const generateRandomNumber = () => {
  return Math.floor((Math.random()) * 1e10).toString(32);
}

// Registeration user exists checker
const regChecker = (email, password) => {

  // This is used to check if email matches
  if (password === undefined) {
    for (randId in users) {
      if (users[randId].email === email){
        return true;
      };
    } return false;
  };
};
// Reverse an object
// const reverseObject = (object) => {
//   let tempArray = [];
//   let outputObject = {}
//   for (item in obj) {
//     tempArray.push(item);
//   };
//   tempArray.reverse();
//   tempArray.forEach((thing) => {
//     outputObject[]
//   }
// }


// ------------ GET


app.get("/", (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.session.user_id]};
  res.render('index', templateVars);
});

app.get('/urls', (req,res) => {
  let customLinks = {}
  for (let link in urlDatabase){
    if (urlDatabase[link].createdBy === req.session.user_id){
      customLinks[link] = urlDatabase[link];
    };
  };
  let templateVars = { url: customLinks,
    username: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

/*

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
*/

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.cookies["user_id"]};
  if (urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.longURL = urlDatabase[req.params.id];
  } else templateVars.longURL = "Url not in database."
  res.render("urls_show", templateVars);
});
*/

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get('/register', (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.session.user_id};
  res.render('register');
})

// --------- POST

// Delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
});

// Create URL
app.post("/urls", (req, res) => {
  if (users.hasOwnProperty(req.session.user_id)) {
    let newID = generateRandomNumber()
    urlDatabase[newID] = {
      longURL: req.body.longURL,
      createdBy: req.session.user_id
    },
    res.redirect('/urls')
  } else {res.status(403).send({error: 'Please Log In'})};
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  if (users.hasOwnProperty(req.session.user_id)) {
    urlDatabase[req.params.id] = {
      longURL: req.body.newURL,
      createdBy: req.session.user_id
    },
    res.redirect('/urls')
  } else {res.status(403).send({error: 'Please Log In'})};
});

// Login
app.post("/login", (req, res) => {
  for (user in users) {

    if (users[user].email === req.body.email && bcrypt.compareSync(req.body.password, users[user].password)) {


      req.session.user_id = users[user].id;
      res.redirect('/urls');
      return;
    };
  };
  res.status(403).send({error: 'User and Password do not match'});
});

// Logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/');
});


// Register
app.post('/register', (req, res) => {

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send({error: 'Email or password empty'});
  } else if (regChecker(req.body.email)) {
    res.status(400).send({ error: 'Email already in database'})
  } else {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
