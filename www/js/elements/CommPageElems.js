/**
 CommPageElems Backbone > View
 @class CommPageElems elements
 @constructor
 @return {Object} instantiated CommPageElems
 **/
define(['jquery', 'backbone'], function ($, Backbone) {

    var CommPageElems = Backbone.View.extend({

        initialize: function () {

            // elements
            this.NOW_SERVING = '#nowServing'
            this.FIELD1 = '#field1';
            this.FIELD2 = '#field2';
            this.FIELD3 = '#field3';

            // templates

            // classes


        }
    });

    return CommPageElems;
});


