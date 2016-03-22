require('dotenv').config({silent: true});
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var request = require('request');

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
    next();
  } else
    res.status(404).send('Sorry! The gatekeaper refuses to allow you to enter!');
});

app.get('/', function (req, res) {
  res.render('pages/index.ejs', {repoName: repo});
});

app.post('/', function (req, res) {
  var username = req.body.username;
  console.log("granting access to user " + username);
  request.put({
    url:'https://api.github.com/repos/' + owner + '/' + repo + '/collaborators/' + username + '?access_token=' + githubToken,
    headers: {
      'User-Agent': 'github-collaborator'
    }
  }, function (err, gres, body) {

    if (gres.statusCode == 204) {
      res.send("you are successfully added as a collaborator");
    } 
    else if (body) {
      var data = JSON.parse(body);
      res.send(data);
    }
    else {
      res.send("Mayday! Our ship hit some rock or your username is incorrect :P");
    }
  });
});

app.listen(port, function () {
  console.log("app is listening on " + port);
});
