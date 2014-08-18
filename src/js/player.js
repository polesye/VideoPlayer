;(function () {
    'use strict';
    s2js.API = {};
    s2js.i18n = {
        t: function (s) { return s; }
    };

    s2js.Video = function (type, element, options) {
        this.element = element[0];
        return this.initialize.apply(this, arguments);
    };

    s2js.Video.prototype = {
        initialize: function (type, element, options) {
            var slice = Array.prototype.slice,
                videoHolder = this.build.apply(this, slice.call(arguments, 1));

            if (!s2js.Utils.isFunction(s2js.API[type])) {
                throw new TypeError(type + ' is not a function.');
            }

            this.options = $.extend({}, {plugins: []}, options);
            this.media = new s2js.API[type](videoHolder, options);
            this.initializeComponents();

            return this.media;
        },

        build: function (element, options) {
            return $('<div />', {'class': 'video-holder'})
                .attr('id', s2js.Utils.uniqueId('s2js-player-'))
                .appendTo(element.addClass('s2js-player'));
        },

        initializeComponents: function () {
            var player = this, media = this.media;

            $.each(this.options.plugins, function(index, Component) {
                if (s2js.Utils.isFunction(Component)) {
                    new Component(player, media);
                } else {
                    throw new TypeError('Component has incorrect type.');
                }
            });
        }
    };

    // s2js.Video.plugins = [s2js.VCR, s2js.PlayButton, s2js.MuteButton, s2js.ProgressSlider, s2js.Transcripts];
}());
