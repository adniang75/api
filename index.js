'use strict';

var cors = require('cors');
var express = require('express');
var request = require('request');
var path = require('path');
var yahooFinance = require('yahoo-finance');

// Express App
var app = express();

// Enable CORS
app.use(cors());

app.set('port', (process.env.PORT || 5000));

var router = express.Router();

// Endpoint to load snapshot data from yahoo finance
router.get('/stocks/snapshot', function(req, res) {
  if (req.query.symbols) {
    var symbols = req.query.symbols.split(',');
    symbols.map(function(symbol) {
      return symbol.toUpperCase();
    });

    yahooFinance.snapshot({
      symbols: symbols
    }, function(err, snapshot) {
      if (err) {
        res.status(401).send(err);
      }

      res.status(200).send(snapshot);
    });
  } else {
    res.status(400).send({message: 'The request requires at least one symbol. Try adding "?symbols=appl" to the request.'});
  }
});

// Endpoint to load historical data from yahoo finance.
router.get('/stocks/historical/:symbol', function(req, res) {
  var today = new Date();
  var yearAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 365);
  yahooFinance.historical({
    symbol: req.params.symbol,
    from: yearAgo.toString(),
    to: today.toString()
  }, function(err, quotes) {
    if (err) {
      res.status(500).send(err);
    }

    res.status(200).send(quotes);
  });
});

// Endpoint to load an ipsum image.
router.get('/images', function(req, res) {
  var categories = ['abstract', 'animals', 'business', 'cats', 'city', 'food', 'nightlife', 'fashion', 'people', 'nature', 'sports', 'technics', 'transport'];

  var path = [];
  path.push(req.query.width ? req.query.width : 400);
  path.push(req.query.height ? req.query.height : 400);
  path.push(categories.indexOf(req.query.category) >=0 ? req.query.category : 'abstract');
  if (req.query.text) {
    path.push(req.query.text);
  }

  req.pipe(request('http://lorempixel.com/' + path.join('/'))).pipe(res);
});

router.get('/', function(req, res) {
  res.status(200).send('Welcome to the Angular 2 in Action API. See <a href="https://github.com/angular-in-action/api#readme">https://github.com/angular-in-action/api#readme</a> for details.');
});

app.use('/', router);

app.listen(app.get('port'), function() {
  console.log('App is running on port ', app.get('port'));
});
