= Ingress Passcode Scraper =
This is a rewrite/variation of Patrick Boos ingress-passcode-redeemer. I tried to make it more configurable and a little more feature-rich. Much thanks to Patrick for the inspiration and some relevant code snippets (specifically, automating google login/passcode redemption in casperjs)

== Running ==
These instructions are for osx/unix-like systems. Sorry, windows folk, you're gonna have to figure it out on your own.

* install phantomjs
* cd ingress-passcode-scraper
* cp config.sample.json config.json
* chmod 600 config.json
* edit config.json as you see fit
* npm install
* node app
* ???
* profit!