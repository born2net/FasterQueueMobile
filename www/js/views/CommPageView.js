/**
 CommPageView Backbone > View
 @class CommPageView
 @constructor
 @return {Object} instantiated CommPageView
 **/
define(['jquery', 'backbone', 'PageView', 'AuthCollection', 'NoteModel'], function ($, Backbone, PageView, AuthCollection, NoteModel) {

    var CommPageView = PageView.extend({

        location: "/pages/CommPage.html",
        pageID: "CommPage",

        /**
         Init called from PageView base class
         @method _initialize
         **/
        _initialize: function () {
            var self = this;
            self._listenSendPong();
            self._initModelsCollection();
            //self._pollNowServicing();
        },

        /**
         Get the last called service_id for line
         @method _pollNowServicing server:LastCalledQueue
         **/
        _pollNowServicing: function () {
            var self = this;

            var lastCalledQueue = function () {

                $.ajax({
                    url: 'https://secure.digitalsignage.com:442/LastCalledQueue',
                    data: {
                        business_id: self.myNotes1.at(0).get('business_id'),
                        line_id: self.myNotes1.at(0).get('line_id')
                    },
                    success: function (i_model) {
                        $(BB.Elements.NOW_SERVING).text(i_model.service_id);

                    },
                    error: function (e) {
                        log('error ajax ' + e);
                    },
                    dataType: 'json'
                });
            };
            self.m_statusHandler = setInterval(function () {
                lastCalledQueue();
            }, 5000);
            lastCalledQueue();
        },

        /**
         Create all the models and collections that we use to communicate with other pages and to server
         @method _initModelsCollection
         **/
        _initModelsCollection: function () {
            var self = this;

            self.myNotes1 = new AuthCollection([], {locationUrl: '/BusinessInfo'});
            self.myNotes1.on('onLineId', function () {
                self._pollNowServicing();
            });
            return;

            self.myNotes1 = new AuthCollection([], {locationUrl: '/cat'});
            var note = new NoteModel();
            self.myNotes1.add(note);
            note.save();
            self.myNotes1.fetch();

            self.myNotes2 = new AuthCollection([], {locationUrl: '/dog'});
            var note = new Backbone.Model({'foo': 'bar3'});
            self.myNotes2.add(note);
            note.save();
            self.myNotes2.fetch();

            self.myNotes3 = new AuthCollection([], {locationUrl: '/lion'});
            var note = new Backbone.Model({'foo': 'bar4'});
            self.myNotes3.add(note);
            note.save();

            $(BB.Elements.FIELD1).on('blur', function (e) {
                var val = $(this).val();
                self.myNotes1.at(0).set('foo', val);
                self.myNotes1.at(0).save();
            });

            $(BB.Elements.FIELD2).on('blur', function (e) {
                var val = $(this).val();
                self.myNotes2.at(0).set('foo', val);
                self.myNotes2.at(0).save();
            });

            $(BB.Elements.FIELD3).on('blur', function (e) {
                var val = $(this).val();
                self.myNotes3.at(0).set('foo', val);
                self.myNotes3.at(0).save();
            });
        },

        /**
         Listen to click on pong channel events
         @method _listenSendPong
         **/
        _listenSendPong: function () {
            var self = this;
            var unsubscribe = BB.comBroker.listenWebViews('pingpong', function (e, reply) {
                log(e.fromWebView);
                log('11111' + e.event);
                log(e.data);
                reply('echo reply...'); // need to setup listener on other side
            });
        }
    });

    return CommPageView;
});


