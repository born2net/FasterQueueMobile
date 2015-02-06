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
            this.NOW_SERVING_LABEL = '#nowServingLabel';
            this.GET_INLINE = '#getInLine';
            this.RELEASE_SPOT = '#releaseSpot';
            this.LINE_POSITION_WRAP= '#linePositionWrap';
            this.VERIFICATION_WRAP = '#verificationWrap';

            // templates

            // classes


        }
    });

    return CommPageElems;
});


