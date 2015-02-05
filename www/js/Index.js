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

            self._loadSaveData();

            self.myNotes1 = new AuthCollection([], {locationUrl: '/BusinessInfo'});

            self._initPages();
            self._listenJoinQueue();
            self._listenOrientationChange();


        },

        _loadSaveData: function () {
            var self = this;
            var savedData = simplestorage.get('fq');
            self._clearLocalData();
            if (savedData) {
                simplestorage.set('fq', savedData);
                $(BB.Elements.LINE_ID).val(savedData.line_id);
            }
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