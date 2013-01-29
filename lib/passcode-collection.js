var Backbone = require('backbone')
  , _ = require('underscore')

module.exports = Backbone.Collection.extend({
  parse: function(response) {
    return _.map(response, function(code) {
      return { id: code }
    })
  }
})