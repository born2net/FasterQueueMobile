/**
 Settings Backbone > View
 @class NoteModel
 @constructor
 @return {Object} instantiated FQCreatorView
 **/
define(['jquery', 'backbone'], function ($, Backbone) {


    var NoteModel = Backbone.Model.extend({
        urlRoot: 'https://secure.digitalsignage.com:443/GetDateTime',
        defaults: {
            business_id: -1,
            line_id: -1
        }

    });

    return NoteModel;
});


