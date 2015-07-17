/*global TfkLaws, $*/


window.TfkLaws = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        
         var router = new TfkLaws.Routers.App();
         Backbone.history.start();
    }
};

$(document).ready(function () {
    'use strict';
    TfkLaws.init();
});
