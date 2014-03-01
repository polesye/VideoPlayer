;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

    s2js.API = {};

    s2js.playerIndex = 0;

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


            this.options = $.extend({}, {
                plugins: []
            }, options);

            if (typeof s2js.API[type] !== "function") {
                throw new TypeError(type + ' is not a function.');
            }

            this.media = new s2js.API[type](videoHolder, options);
            this.initializeComponents();
            s2js.playerIndex += 1;

            return this.media;
        },
        build: function (element, options) {
            var videoHolder = $('<div class="video-holder" />');

            $(element).addClass('s2js-player');
            videoHolder
                .attr('id', 's2js-player-' + s2js.playerIndex)
                .appendTo(element);

            return videoHolder;
        },

        initializeComponents: function () {
            var player = this,
                media = this.media;

            $.each(this.options.plugins, function(index, Component) {
                if (typeof Component === "function") {
                    new Component(player, media);
                } else {
                    throw new TypeError('Component has incorrect type.');
                }
            });
        }
    };

    // s2js.Video.plugins = [s2js.VCR, s2js.PlayButton, s2js.MuteButton, s2js.ProgressSlider, s2js.Transcripts];

}());
