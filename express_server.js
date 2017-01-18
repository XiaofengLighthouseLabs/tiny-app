const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomNumber = () => {
  return Math.floor((Math.random()) * 1e10).toString(32);
}


// GET
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get('/urls', (req,res) => {
  let templateVars = { url: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  if (urlDatabase.hasOwnProperty(req.params.id)){
    templateVars.longURL = urlDatabase[req.params.id];
  } else templateVars.longURL = "Url not in database."
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  res.redirect(urlDatabase[req.params.shortURL]);
});


// POST

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
  res.send(`<h3> Shortened ${req.body.longURL} to ${newID}<h3>`);         // Respond with 'Ok' (we will replace this)
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.newURL
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

