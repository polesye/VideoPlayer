;(function (global, undefined) {
    "use strict";
    var HTML5Wrapper = function (container, options) {

        this.initialize.apply(this, arguments);
    };

    HTML5Wrapper.prototype = {

        initialize: function (container, config) {
            var defaults = {
                    availablePlaybackRates: [0.5, 1.0, 1.5, 2.0],
                    // List of video sources.
                    sources: []
                },
                defaultProperties = {
                    // {float} Gets the current volume as a value between 0.0 and 1.0
                    volume: 1,
                    // {float} Gets  the current playback rate. This may be affected by
                    // the user causing the media to play faster or slower.
                    playbackRate: 0,
                    // {boolean} Gets or sets the `autoplay` flag.
                    autoplay: false,
                    // {boolean} Gets or sets the `controls` attribute, which displays or hides
                    // the controls.
                    controls: false,
                    // {boolean} Gets or sets whether the media should loop back to the start
                    // when finished.
                    loop: false,
                    // {boolean} Gets or sets if the media is muted.
                    muted: false,
                },
                options = $.extend({}, config),
                properties = {};

            $.each(config, function (key, value) {
                if (key in defaultProperties) {
                    properties[key] = value;
                    delete options[key];
                }
            });

            $.extend(this, {
                options: $.extend({}, defaults, options),
                // {float} The number of seconds that have been played.
                currentTime: 0,
                // {float} The total number of seconds for the media
                duration: 0,
                // {boolean} Indicates if the player is paused.
                paused: false,
                // {boolean} Indicates if the media has completely played.
                ended: false,
                state: 0
            }, defaultProperties, properties);

            this.build.call(this, container);

            return this;
        },
        build: function (container) {
            var self = this,
                media = document.createElement('video'),
                sourcesFragment = document.createDocumentFragment();

            // Generate sources.
            $.each(this.options.sources, function(index, src) {
                var source = document.createElement('source');
                source.src = src + '?' + (new Date()).getTime();
                source.type = self.getVideoType(src);
                sourcesFragment.appendChild(source);
            });

            media.appendChild(sourcesFragment);

            // Append video element to the DOM.
            container.append(media);

            this.$media = $(media);
            this.media = media;

            return this;
        },
        destroy: function () {
            this.$media.remove();

            return this;
        },
        play: function () {
            this.media.play();

            this.paused = false;
        },
        pause: function () {
            this.media.pause();

            this.paused = true;
        },
        mute: function () {
            this.media.muted = this.muted = true;
        },
        unMute: function () {
            this.media.muted = this.muted = false;
        },
        setCurrentTime: function (seconds) {
            this.media.currentTime = this.currentTime = seconds;
        },
        setVolume: function (volume) {
            this.media.volume = this.volume = volume;
        },
        setPlaybackRate: function (suggestedRate) {
            this.media.playbackRate = this.playbackRate = suggestedRate;
        },
        getAvailablePlaybackRates: function () {
            return this.options.availablePlaybackRates;
        },
        getPlayerState: function () {
            return this.state;
        },
        getVideoType: function (src) {
            var url = src.split('?')[0],
                ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

            return 'video/' + ext;
        }
    };

    window.HTML5Wrapper = HTML5Wrapper;
}(this));
