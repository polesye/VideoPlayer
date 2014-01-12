;(function (global, undefined) {
    "use strict";
    var HTML5Wrapper = function (container, options) {
        this.initialize.apply(this, arguments);
    };

    HTML5Wrapper.prototype = {
        initialize: function (container, options) {
            $.extend(true, this, {
                // {float} The number of seconds that have been played.
                currentTime: 0,
                // {float} The total number of seconds for the media
                duration: 0,
                 // {float} Gets the current volume as a value between 0.0 and 1.0
                volume: 1,
                // {float} Gets  the current playback rate. This may be affected by
                // the user causing the media to play faster or slower.
                playbackRate: 0,
                // {float} Gets or sets the location in the media file, in seconds, where
                // playing should begin.
                startTime: null,
                // {float} Gets or sets the location in the media file, in seconds, where
                // playing should end.
                endTime: null,
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
                // {boolean} Indicates if the player is paused.
                paused: false,
                // {boolean} Indicates if the media has completely played.
                ended: false,
            }, options);


            this.build.call(this, container);

            return this;
        },
        build: function (container) {
            var html = s2js.Utils.printf([
                '<video width="{0}" height="{1}" {2}>',
                    '{3}',
                '</video>'
            ].join(''),
                320, 240, (this.hasControls) ? 'controls': '',
                [
                    '<source src="movie.mp4" type="video/mp4">',
                    '<source src="movie.webm" type="video/webm">',
                    '<source src="movie.ogg" type="video/ogg">'
                ].join('')
            );

            container.append(html);
            this.$media = container.find('video');
            this.media = container.find('video').get(0);

            return this;
        },
        destroy: function () {
            this.$media.remove();

            return this;
        },
        play: function () {
            this.media.play();
        },
        pause: function () {
            try {
                this.media.pause();
            } catch (e) {

            }
        },
    };

    window.HTML5Wrapper = HTML5Wrapper;
}(this));
