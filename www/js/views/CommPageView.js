/**
 CommPageView Backbone > View
 @class CommPageView
 @constructor
 @return {Object} instantiated CommPageView
 **/
define(['jquery', 'backbone', 'PageView', 'AuthCollection', 'NoteModel', 'simplestorage'], function ($, Backbone, PageView, AuthCollection, NoteModel, simplestorage) {

    var CommPageView = PageView.extend({

        location: "/pages/CommPage.html",
        pageID: "CommPage",

        /**
         Init called from PageView base class
         @method _initialize
         **/
        _initialize: function () {
            var self = this;

            //self.m_base_url = BB.CONSTS.BASE_URL + '?mode=remoteStatus&param=';

            self._initModelsCollection();
            self._listenLineButtons();
            self._disableBackButto();
        },

        _disableBackButto: function () {
            var self = this;
            var leftButton = new steroids.buttons.NavigationBarButton();
            var rightButton = new steroids.buttons.NavigationBarButton();
            leftButton.title = "";
            leftButton.onTap = function () {
            };
            rightButton.title = "";
            rightButton.onTap = function () {
            };

            steroids.view.navigationBar.update({
                title: 'virtual queue',
                overrideBackButton: true,
                buttons: {
                    left: [leftButton],
                    right: [rightButton]
                }
            }, {
                onSuccess: function () {
                    steroids.view.navigationBar.show();
                },
                onFailure: function () {
                }
            });
        },

        _listenLineButtons: function () {
            var self = this;

            $(BB.Elements.GET_INLINE).on('click', function () {
                log('models ' + self.myNotes1.models.length);
                $.ajax({
                    url: BB.CONSTS.BASE_URL + '/SendQueueSMSEmail',
                    data: {
                        business_id: self.myNotes1.at(0).get('business_id'),
                        line_id: self.myNotes1.at(0).get('line_id'),
                        call_type: 'MOBILE',
                        url: BB.CONSTS.BASE_URL
                    },
                    success: function (e) {
                        self.myNotes1.at(0).set('service_id', e.service_id);
                        self.myNotes1.at(0).set('verification_id', e.verification);
                        self.myNotes1.at(0).save();
                        self._onQueueDataAvailable();
                    },

                    error: function (e) {
                        log('error ajax ' + e);
                    },
                    dataType: 'json'
                });
            });

            $(BB.Elements.RELEASE_SPOT).on('click', function () {
                simplestorage.deleteKey('fq');
                $('.goodbye').hide();
                setTimeout(function () {
                    navigator.app.exitApp();
                }, 2000);
                $(BB.Elements.NOW_SERVING_LABEL).text('Goodbye');
                //supersonic.ui.layers.pop();
            });
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

        /**
         Whenever data is available, regardless if it's fresh from the server or via the LocalStorage,
         we proceed by updating UI to indicate to customer his position in the queue as well as update the
         local storage with all latest data
         @method _onQueueDataAvailable
         **/
        _onQueueDataAvailable: function () {
            var self = this;

            self._getServerDateTime(function (i_date) {

                self.myNotes1.at(0).set('date', i_date.date);

                var saveData = {
                    business_id: self.myNotes1.at(0).get('business_id'),
                    line_id: self.myNotes1.at(0).get('line_id'),
                    service_id: self.myNotes1.at(0).get('service_id'),
                    verification_id: self.myNotes1.at(0).get('verification_id'),
                    date: self.myNotes1.at(0).get('date')
                };
                simplestorage.set('fq', saveData);

                $(BB.Elements.GET_INLINE).hide();
                $(BB.Elements.RELEASE_SPOT).show();
                $(BB.Elements.LINE_POSITION_WRAP).show();
                $(BB.Elements.VERIFICATION_WRAP).show();
                $(BB.Elements.LINE_POSITION_WRAP).find('span').text(self.myNotes1.at(0).get('service_id'));
                $(BB.Elements.VERIFICATION_WRAP).find('span').text(self.myNotes1.at(0).get('verification_id'));
            });

        },

        /**
         Get the last called service_id for line
         @method _pollNowServicing server:LastCalledQueue
         **/
        _pollNowServicing: function () {
            var self = this;

            var lastCalledQueue = function () {

                $.ajax({
                    url: BB.CONSTS.BASE_URL  + '/LastCalledQueue',
                    data: {
                        business_id: self.myNotes1.at(0).get('business_id'),
                        line_id: self.myNotes1.at(0).get('line_id')
                    },
                    success: function (i_model) {
                        $(BB.Elements.NOW_SERVING).text(i_model.service_id);
                        if (i_model.service_id == self.myNotes1.at(0).get('service_id')) {
                            navigator.notification.beep('1');
                            navigator.notification.vibrate(2000);
                        }

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
            self.myNotes1.on('sync', function () {

                if (self.myNotes1.at(0).get('service_id') == undefined) {
                    $(BB.Elements.GET_INLINE).trigger('click');
                } else {
                    self._onQueueDataAvailable();
                }
            });

            self.myNotes1.on('onLineId', function () {
                self._pollNowServicing();
            });

            BB.comBroker.fireWebViews('commPageReady');
        }
    });

    return CommPageView;
});


