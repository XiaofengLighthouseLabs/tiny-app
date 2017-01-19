const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

/*app.use(express.session({

}))
*/
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

// Globals
const users = {
  "user1Id": {
    id: "user1Id",
    email: "user@example.com",
    password: 'password'},
  'user2Id': {
    id: 'user2Id',
    email: 'user2@example.com',
    password: 'password'}
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

  // This checks if email and password matches (This needs to be refactored...)
  for (randId in users) {

    if (users[randId].email === email && users[randId].password === password){
      return randId;
    };
  } return false;
};



// GET
app.get("/", (req, res) => {
  let templateVars = { url: urlDatabase, username: users[req.cookies["user_id"]]};

  // console.log(users[req.cookies]);
  res.render('index', templateVars);
});

app.get('/urls', (req,res) => {
  let templateVars = { url: urlDatabase, username: users[req.cookies["user_id"]]};
  // console.log(templateVars);
  // console.log(users);
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.cookies["user_id"]};
  if (urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.longURL = urlDatabase[req.params.id];
  } else templateVars.longURL = "Url not in database."
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get('/register', (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.cookies["user_id"]};
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
  let newID = generateRandomNumber()
  console.log(newID + ':' + req.body.longURL);  // debug statement to see POST parameters
  urlDatabase[newID] = req.body.longURL
  console.log(urlDatabase);
  res.redirect('/urls')
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

// Login
app.post("/login", (req, res) => {
  // res.send('Hello', req.body.username);
  // should return user_id, which is a random string
  if (regChecker(req.body.email, req.body.password) !== false) {
    res.cookie('user_id', regChecker(req.body.email, req.body.password));
    res.redirect('/urls');
  } else { res.status(403).send({error: "username and password do not match"})};
  // res.cookie('username', req.body.email);
  // res.cookie('password', req.body.password);
});

// Logout
app.post('/logout', (req, res) => {
  res.cookie('user_id', 'uselessvalue', {expires: new Date(0)});
  res.redirect('/');
});


// Register
app.post('/register', (req, res) => {

  console.log(regChecker(req.body.email));
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send({error: 'Email or password empty'});
  } else if (regChecker(req.body.email)) {
    console.log('Email checker works!');
    res.status(400).send({ error: 'Email already in database'})
  } else {
    let newUserId = generateRandomNumber();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', newUserId);
    res.redirect('/urls');

  };

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
