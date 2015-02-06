/**
 BackSteroids, License MIT !!!
 Visit Github https://github.com/born2net/BackSteroids
 @class App
 @constructor
 @return {Object} instantiated App
 **/
define(['Setup', 'LocalCollection', 'AuthCollection', 'Elems', 'StackView', 'NoteModel', 'simplestorage'], function (Setup, LocalCollection, AuthCollection, Elems, StackView, NoteModel, simplestorage) {
    var App = Backbone.Controller.extend({
        initialize: function () {
            var self = this;
            log('======================================');
            window.BB.Elements = new Elems();
            // localization
            require(['LanguageSelectorView'], function (LanguageSelectorView) {
                new LanguageSelectorView({el: BB.Elements.LANGUAGE_SELECTOR});
            });

            self.myNotes1 = new AuthCollection([], {locationUrl: '/BusinessInfo'});

            self._loadSaveData();
            self._listenJoinQueue();
            self._listenOrientationChange();
            self._initCommPage();
        },

        _loadSaveData: function () {
            var self = this;
            self.m_savedData = simplestorage.get('fq');
            self._clearLocalData();

            if (self.m_savedData) {
                // if localstorage is from today use, otherwise dump it
                self._getServerDateTime(function (date) {
                    if (self.m_savedData.date == date.date) {
                        simplestorage.set('fq', self.m_savedData);
                        $(BB.Elements.LINE_ID).val(self.m_savedData.line_id);
                    } else {
                        self.m_savedData = undefined;
                    }
                });
            }
        },

        /**
         Get current server date / time
         @method _getServerDateTime server:getDateTime
         @param {Function} i_cb
         **/
        _getServerDateTime: function (i_cb) {
            var self = this;
            $.ajax({
                url: BB.CONSTS.BASE_URL + '/GetDateTime',
                success: function (dateTime) {
                    $.proxy(i_cb, self)(dateTime);
                },
                error: function (e) {
                    log('error ajax ' + e);
                },
                dataType: 'json'
            });
        },

        _clearLocalData: function () {
            var self = this;
            LocalCollection.prototype.deleteStorage();
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
                        self._createModel(i_line_id, e.business_id);
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

        _createModel: function (i_line_id, i_business_id, i_verification_id, i_service_id) {
            var self = this;
            var note = new NoteModel();
            note.set('line_id', i_line_id);
            note.set('business_id', i_business_id);
            note.set('verification_id', i_verification_id);
            note.set('service_id', i_service_id);
            self.myNotes1.add(note);
            note.save();
            self.myNotes1.on('sync', function () {
            });
            // self.myNotes1.fetch();
        },

        /**
         Init the pages
         @method _initCommPage
         **/
        _initCommPage: function () {
            var self = this;
            require(['StackView', 'CommPageView'], function (StackView, CommPageView) {
                self.m_commPageView = new CommPageView({
                    init: false
                }).initializePage();

                BB.comBroker.listenWebViews('commPageReady', function () {
                    if (self.m_savedData) {
                        self._createModel(self.m_savedData.line_id, self.m_savedData.business_id, self.m_savedData.verification, self.m_savedData.service_id);
                        supersonic.ui.layers.push(self.m_commPageView.getPageView());
                    } else {
                        $(BB.Elements.JOIN_QUEUE).show();
                    }
                });
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