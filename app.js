// Globals
var _ = require('underscore')
, fs = require('fs')
, spawn = require('child_process').spawn

, config = require(__dirname + '/config.json')
, _package = require(__dirname + '/package.json')
, phantomjs = config.phantomjs || 'phantomjs'

, Twitter = require('ntwitter')
, PollingRequest = require(__dirname + '/lib/polling-request')
, PasscodeCollection = require(__dirname + '/lib/passcode-collection')

, collection = new PasscodeCollection()
, twitter = new Twitter(config.twitter)

// Use our regular expressions to sniff out passcodes
, parse = function(data) {
  var matches = []
  _.each(config.patterns, function(pattern) {
    var pattern = new RegExp(pattern, 'g')
    , codes = data.match(pattern)
    if (codes) matches = matches.concat(codes)
  })
  return collection.parse(_.uniq(matches))
}

// Fork a phantomjs process to redeem a passcode
, redeem = function(passcode) {
  var args = [
    '--cookies-file='+__dirname+'/.phantom-cookies.txt'
    , __dirname+'/lib/phantom-redeem.js'
    , config.email
    , config.password
    , passcode
    ]
  , process = spawn(phantomjs, args)
  process.stdout.setEncoding('utf-8')
  process.stderr.setEncoding('utf-8')
  process.stdout.on('data', function(data) { console.log(data.toString().replace(/\r?\n$/, '')) })
  process.stderr.on('data', function(data) { console.error(data.toString().replace(/\r?\n$/, '')) })
}

// Greet the user with a friendly message
console.log('Initializing ingress passcode scraper', _package.version)

// Attach event listeners to the collection
collection.on('add', function(passcode) { redeem(passcode.id) })

// Iterate over our configured sites and set up a new PollingRequest for each one
_.each(config.sites, function(url) {
  // Create a new polling service for this url
  var service = new PollingRequest({
    url: url
  , interval: config.interval
  })

  // The first time we get data back from this source, we're going to suppress
  // events on the passcodes collection to avoid attempting to redeem
  // historical passcodes (we only want new ones)
  service.once('data', function(data) {
    collection.add(parse(data), { silent: true })
    service.on('data', function(data) {
      collection.add(parse(data))
    })
  })

  service.on('error', console.error, console)
  service.start() // Let's get this party started
})

// Start up the firehose
twitter.stream('statuses/filter',
  config.twitter.filter,
  function(stream) {
  stream.on('data', function (data) {
    collection.add(parse(data.text))
  })
})