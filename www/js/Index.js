/**
 BackSteroids, License MIT !!!
 Visit Github https://github.com/born2net/BackSteroids
 @class App
 @constructor
 @return {Object} instantiated App
 **/
define(['Setup', 'LocalCollection', 'AuthCollection', 'Elems', 'StackView', 'NoteModel'], function (Setup, LocalCollection, AuthCollection, Elems, StackView, NoteModel) {
    var App = Backbone.Controller.extend({
        initialize: function () {
            var self = this;
            log('======================================');
            window.BB.Elements = new Elems();
            // localization
            require(['LanguageSelectorView'], function (LanguageSelectorView) {
                new LanguageSelectorView({el: BB.Elements.LANGUAGE_SELECTOR});
            });

            LocalCollection.prototype.deleteStorage();

            self.myNotes1 = new AuthCollection([], {locationUrl: '/BusinessInfo'});

            self._initPages();
            self._listenJoinQueue();

            return;


            self._initModelsCollection();
            self._listenOrientationChange();
            self._listenGoToCommPage();
            self._listenGetServerTime();
            self._listenSendPing();

        },

        _listenJoinQueue: function () {
            var self = this;
            $(BB.Elements.JOIN_QUEUE).on('click', function () {
                var line_id = $(BB.Elements.LINE_ID).val();
                if (!_.isFinite(line_id)) {
                    alert('you entered an invalid line id' + line_id);
                    return;
                }
                self._getBusinessId(line_id);
            });
        },

        _getBusinessId: function (i_line_id) {
            var self = this;
            $.ajax({
                url: 'https://secure.digitalsignage.com:442/GetBusinessId',
                data: {
                    line_id: i_line_id
                },
                success: function (e) {
                    if (e.status == false) {
                        alert('line# does not exist');
                        return;
                    } else {
                        var note = new NoteModel();
                        note.set('line_id', i_line_id);
                        note.set('business_id', e.business_id);
                        self.myNotes1.add(note);
                        note.save();
                        // self.myNotes1.fetch();
                        supersonic.ui.layers.push(self.m_commPageView.getPageView());
                        return;
                    }
                },
                error: function (e) {
                    alert('err GetBusinessId ' + JSON.stringify(e));
                },
                dataType: 'json'
            });
        },

        /**
         Create all the models and collections that we use to communicate with other pages and to server
         @method _initModelsCollection
         **/
        _initModelsCollection: function () {
            var self = this, note

            self.myNotes1 = new AuthCollection([], {locationUrl: '/BusinessInfo'});
            var note = new NoteModel();
            self.myNotes1.add(note);
            note.save();
            self.myNotes1.fetch();

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

            $(BB.Elements.SAVE_TO_SERVER).on('click', function (e) {
                self.myNotes1.saveToServer(true);
                self.myNotes1.at(0).save({}, {
                    success: function (model) {
                        jlog(model);
                        alert('save success ' + model.get('date'));
                    },
                    error: function (model, e) {
                        alert('err 2 ' + e.responseText);
                        setTimeout(function () {
                            log(JSON.stringify(e));
                        }, 3000)
                    },
                    complete: function () {
                        self.myNotes1.saveToServer(false);
                    }
                });
            });
        },

        /**
         Listen get server time
         @method _listenGetServerTime
         **/
        _listenGetServerTime: function () {
            var self = this;
            $(BB.Elements.GET_SERVER_TIME).on('click', function (e) {
                $.ajax({
                    url: 'https://secure.digitalsignage.com:443/GetDateTime',
                    success: function (dateTime) {
                        alert('time is ' + dateTime.time)
                    },
                    error: function (e) {
                        alert('err 3 ' + JSON.stringify(e));
                    },
                    dataType: 'json'
                });
            });
        },

        /**
         Listen to go to CommPage
         @method _listenGoToCommPage
         **/
        _listenGoToCommPage: function () {
            var self = this;
            $(BB.Elements.GO_TO_COMM_PAGE).on('click', function () {
                supersonic.ui.layers.push(self.m_commPageView.getPageView());
            });
        },

        /**
         Init the pages
         @method _initPages
         **/
        _initPages: function () {
            var self = this;
            require(['StackView', 'CommPageView'], function (StackView, CommPageView) {

                self.m_commPageView = new CommPageView({
                    init: false
                }).initializePage();

            });
        },

        /**
         Listen to click on ping button
         @method _listenOrientationChange
         **/
        _listenSendPing: function () {
            var self = this;
            $(BB.Elements.SEND_PING).on('click', function () {
                BB.comBroker.fireWebViews('pingpong', window.webViewer, {ping: 'echo'});
            });
        },

        /**
         Listen application orientation changess
         @method _listenOrientationChange
         **/
        _listenOrientationChange: function () {
            window.addEventListener('orientationchange', function () {
                switch (window.orientation) {
                    case -90:
                    case 90:
                        alert('landscape');
                        break;
                    default:
                        alert('portrait');
                        break;
                }
            });
        }
    });
    return App;
});