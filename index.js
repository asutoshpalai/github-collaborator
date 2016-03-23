require('dotenv').config({silent: true});
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var request = require('request');
var algorithm = 'aes-256-ctr';

// from https://github.com/chris-rock/node-crypto-examples/blob/master/crypto-ctr.js
function encrypt(text, password){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;

}

function decrypt(text, password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

var repo = process.env.REPO_NAME;
var owner = process.env.REPO_OWNER;
var githubToken = process.env.GITHUB_OAUTH_TOKEN;
var port = process.env.PORT || 8080;

app.use(function (req, res, next) {
  var token = req.query.auth_token;

  if (token && process.env.TOKEN_HASH === crypto.createHash('sha256').update(token).digest('hex')) {
    req.ghTokenPassword = token;
    next();
  }
  else {
    res.status(404).send('Sorry! The gatekeaper refuses to allow you to enter!');
  }
});

app.get('/', function (req, res) {
  res.render('pages/index.ejs', {repoName: repo});
});

app.post('/', function (req, res) {
  var username = req.body.username;

  if (!username.match(/^[A-Z0-9-]+$/i)) {
    return res.send("Hey! What are you trying to do? <br>Enter a valid username");
  }

  console.log("granting access to user " + username);

  addCollaborator(username, res, decrypt(githubToken, req.ghTokenPassword));

});

function addCollaborator(username, res, ghToken) {
  var options = {
    url:'https://api.github.com/repos/' + owner + '/' + repo + '/collaborators/' + username + '?access_token=' + ghToken,
    headers: {
      'User-Agent': 'github-collaborator'
    }
  };

  var resHandler = function (err, gres, body) {

    if (gres.statusCode == 204) {
      res.send("you are successfully added as a collaborator");
    } 
    else if (body) {
      //console.log(gres.toJSON());
      res.send(body);
    }
    else {
      res.send("Mayday! Our ship hit some rock or your username is incorrect :P");
    }
  };

  request.put(options, resHandler );
}

app.listen(port, function () {
  console.log("app is listening on " + port);
});
