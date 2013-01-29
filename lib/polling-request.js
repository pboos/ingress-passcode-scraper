var Events = require('backbone').Events
, request = require('request')
, _ = require('underscore')

, PollingRequest = module.exports = function(options) {

  if (!options) // The options hash needs to be specified
    throw new Error('No request options specified')

  if (!options.url) // And must include at least a url
    throw new Error('No url specified in request options')

  // Cache our options in the object
  this.options = options || {}
  this.interval = options.interval || 60000

  // Initialize the class
  this.initialize.apply(this, arguments)
}

_.extend(PollingRequest.prototype, Events, {
  initialize: function() { return this }
  , start: function() {
    if (!this.timemout) {
      this.timeout = setInterval(_.bind(this.request, this), this.interval)
      this.request()
    }
    return this
  }
  , stop: function() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      delete this.timeout
    }
    return this
  }
  , request: function() {
    request(this.options, _.bind(this._emit, this))
    return this
  }
  , _emit: function(err, res, body) {
    if (err) this.trigger('error', err)
    else this.trigger('data', body)
  }
})