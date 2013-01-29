var page = require('webpage').create()
, server = require('webserver').create()
, args = require('system').args

!function() {

if (args.length !== 4) {
  console.log('Must specify email, password, and a passcode')
  console.log("\tExample:")
  console.log("\tphantomjs "+args[0]+" email@example.com password 0xx0passcodex0x0x")
  return phantom.exit()
}

var email = args[1]
, password = args[2]
, passcode = args[3]
, failures = 0
, max_failures = 3
, navigateToIntel = function() {
  console.log('Opening intel')
  page.open('http://www.ingress.com/intel')
}
, navigateToLogin = function() {
  console.log('Opening login page')
  var loginPage = page.evaluate(function() { return document.getElementsByTagName('a')[0].href })
  page.open(loginPage)
}
, login = function() {
  console.log('Logging in')
  var loginForm = page.evaluate(function(email, password) {
    var form = document.getElementById('gaia_loginform')
    form['Email'].value = email
    form['Passwd'].value = password
    form.submit()
  }, email, password)
}
, requestPin = function() {
  console.log('Submitting request for a new sms pin')
  page.evaluate(function() {
    var form = document.forms['newcode-c']
    if (form) {
      form[8].click()
      form.submit()
    }
  })
}
, smsAuth = function() {
  console.log('Waiting for SMS pin')
  page.zoomFactor = 0.50
  var capture = page.renderBase64()
  server.listen(8080, function(req, res) {
    var pin = req.post && req.post.pin
    res.statusCode = 200
    res.write('<html><body>')
    if (pin) {
      res.write('<h1>Check again in a second</h1>')
      page.evaluate(function(pin) {
        var form = document.forms['verifyForm']
        form['smsUserPin'].value = pin
        form.submit()
      }, req.post.pin)
    } else {
      res.write('<form method="post" style="margin:auto">')
      res.write('<img src="data:img/png;base64,' + capture + '" />')
      res.write('<br />SMS Code: <input type="text" name="pin"/>')
      res.write('</form>')
    }
    res.write('</body></html>')
    res.close()
    if (pin) server.close()
  })
}
, submitPasscode = function() {
  console.log('Submitting', passcode)
  var result = page.evaluate(function(passcode) {
    return jQuery.ajax({
      type: 'POST',
      async: false,
      dataType: 'json',
      url: '/rpc/dashboard.redeemReward',
      data: JSON.stringify({ passcode: passcode }),
      contentType:'application/json; charset=utf-8'
    }).responseText
  }, passcode)
  console.log(passcode, ':', result)
  phantom.exit()
}
, failure = function() {
  failures++
  console.error.apply(console, arguments)
  var stop = failures > max_failures
  stop && phantom.exit(1)
  return !stop
}

page.onLoadFinished = function() {
  var indicators = page.evaluate(function() {
    var pinForm = document.forms['verifyForm']
    return {
      host: window.location.hostname
      , path: window.location.pathname
      , code: !!document.getElementById('passcode')
      , pinField: !!document.getElementById('smsUserPin')
      , pinToken: !!(pinForm && pinForm['smsToken'] && pinForm['smsToken'].value)
    }
  })

  // If there's a passcode field, submit the passcode
  if (indicators.path === '/intel' && indicators.code) submitPasscode()

  // Otherwise, click the login link
  else if (indicators.path === '/intel') navigateToLogin()

  // The login page
  else if (indicators.path === '/ServiceLogin') login()

  // If there's a pin token, we're submitting an sms pin
  else if (indicators.path === '/SmsAuth' && indicators.pinToken) smsAuth()

  // Otherwise we're requesting a new pin
  else if (indicators.path === '/SmsAuth' && indicators.pinField) requestPin()

  // If neither, the page is redirecting us
  else if (indicators.path === '/SmsAuth') { /* redirect... */ }

  // Failed auth
  else if (indicators.path === '/ServiceLoginAuth')
    failure('Login failed') && login()

  // We've reached some unknown page
  else
    failure('Unrecognized page', indicators.host, indicators.path) && navigateToIntel()
}

navigateToIntel()

}(page, server, args)

