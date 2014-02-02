// state = {
//     unstarted: -1,// init player
//     ended: 0,
//     playing: 1,
//     paused: 2,
//     buffering: 3,
//     video cued: 5 // canplay
// }
// When the player first loads a video, it will broadcast an unstarted (-1) event.
// When a video is cued and ready to play, the player will broadcast a video
// cued (5) event.

;(function (global, undefined) {
    "use strict";
    var HTML5 = function (container, options) {

        this.initialize.apply(this, arguments);
    };

    HTML5.prototype = {

        initialize: function (container, config) {
            var self = this,
                defaults = {
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
                    height: 240,
                    width: 400,
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
                currentTime: 0,
                duration: 0,
                paused: true,
                ended: false,
                state: -1
            }, defaultProperties, properties);

            this.build.call(this, container);

            $.each(properties, function(property, value) {
                self.media[property] = value;
            });

            return this;
        },
        build: function (container) {
            var self = this,
                media = document.createElement('video'),
                text = document.createTextNode('Your user agent does not support the HTML5 Video element.'),
                sourcesFragment = document.createDocumentFragment();

            // Generate sources.
            $.each(this.options.sources, function(index, src) {
                var type = self.getVideoType(src),
                    source;

                if (type) {
                    source = document.createElement('source');
                    source.src = src + '?' + (new Date()).getTime();
                    source.type = self.getVideoType(src);
                    sourcesFragment.appendChild(source);
                }
            });

            sourcesFragment.appendChild(text);
            media.appendChild(sourcesFragment);

            // Append video element to the DOM.
            container.append(media);

            this.media = this.element = media;

            return this.media;
        },
        destroy: function () {
            $(this.element).remove();

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
            return [0.5, 1.0, 1.5, 2.0];
        },
        getPlayerState: function () {
            return this.state;
        },
        getVideoType: function (src) {
            var url = src.split('?')[0],
                ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase(),
                formats = ['mp4', 'webm', 'ogv'];

            return $.inArray(ext, formats) !== -1 ? 'video/' + ext : null;
        }
    };

    s2js.API['HTML5'] = HTML5;
}(this));
