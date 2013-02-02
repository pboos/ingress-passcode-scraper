# Ingress Passcode Scraper
This is a rewrite of [Patrick Boos'](https://github.com/pboos) [ingress-passcode-redeemer](https://github.com/pboos/ingress-passcode-redeemer).
I tried to make it more configurable and a little more feature-rich.
Much thanks to Patrick for the inspiration and some relevant code snippets
(specifically, automating google login/passcode redemption in casperjs)

## Running
These instructions are for osx/unix-like systems. Sorry, windows folk, you're gonna have to figure it out on your own.

* install [phantomjs](http://phantomjs.org/)
* `cd ingress-passcode-scraper`
* `cp config.sample.json config.json`
* `chmod 600 config.json`
* edit config.json as you see fit
* `npm install`
* `node app`
* ???
* profit!

## Two-factor auth
If you use two-factor authentication with your google account,
you will receive an sms pin from google
when the redeem script successfully logs into your google acount for the first time.
Two enter the sms pin, navigate to http://server_address:8080.
To change the default port number, feel free to edit it in lib/phantom-redeem.js.

After successfully authenticating, the you shouldn't have to authenticate again
until you manually sign out of your google account,
or 30 days have passed since you successfully authenticated.

If you want to pre-cache the a cookie file to get started, execute:
`phantomjs --cookies-file=.phantom-cookies.txt lib/phantom-redeem.js email@example.com secret_password fake_passcode`
