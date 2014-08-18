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
    'use strict';
    var YoutubeWrapper = function (container, options) {

        this.initialize.apply(this, arguments);
    };

    YoutubeWrapper.prototype = {
        initialize: function (container, config) {
            var self = this,
                defaults = {
                    videoId: '',
                },
                defaultProperties = {
                    volume: 1,
                    muted: false,
                    playbackRate: 1.0,
                    playbackQuality: 'unknown',
                },
                defaultPlayerVars = {
                    'autoplay': 0,
                    'controls': 1,
                    'rel': 0,
                    'modestbranding': 0,
                    'enablejsapi': 1,
                    'wmode': 'transparent',
                    'html5': 1,
                    'showinfo': 0,
                    'loop': 0,
                    'height': 240,
                    'width': 400
                    // 'start': 200
                },
                options = $.extend({}, config),
                properties = {}, playerVars = {};

            $.each(config, function (key, value) {
                if (key in defaultProperties) {
                    properties[key] = value;
                    delete options[key];
                } else if (key in defaultPlayerVars) {
                    playerVars[key] = value;
                    delete options[key];
                }
            });

            $.extend(this, {
                options: $.extend({}, defaults, options),
                currentTime: 0,
                duration: 0, // NaN in html5
                paused: true,
                ended: false
            }, defaultProperties, properties);

            playerVars = $.extend({}, defaultPlayerVars, playerVars);

            window.onYouTubePlayerAPIReady = function () {
                self.build.call(self, container, playerVars);
            };

            this.loadAPI();
            this.element = container[0];

            this.element.addEventListener('canplay', function () {
                if (self.muted) {
                    self.mute();
                } else {
                    self.unMute();
                }

                self.setVolume(self.volume);
            }, false);

            this.element.addEventListener('play', function () {
                var isCalled = false;

                return function () {
                    if (isCalled) return;

                    self.setPlaybackRate(self.playbackRate);
                    // TODO: call `qualitychange` event 4 times.
                    self.setPlaybackQuality(self.playbackQuality);
                };
            } (), false);

            return this;
        },
        loadAPI: function () {
            var tag = document.createElement('script'),
                firstScriptTag = document.getElementsByTagName('script')[0];

            tag.src = 'https://www.youtube.com/player_api';
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        },
        build: function (container, playerVars) {
            var self = this,
                containerId = container.attr('id');

            s2js.Utils.fireEvent(this.element, 'loadstart');

            this.media = new YT.Player(containerId, {
                height: '390',
                width: '640',
                videoId: this.options.videoId,
                playerVars: playerVars,
                events: {
                    onReady: function (e) {
                        setInterval(self.updateState.bind(self), 250);
                        s2js.Utils.fireEvent(self.element, 'canplay');
                    },
                    onPlaybackQualityChange: function (e) {
                        self.playbackQuality = self.media.getPlaybackQuality();
                        s2js.Utils.fireEvent(self.element, 'qualitychange');
                    },
                    onPlaybackRateChange: function (e) {
                        self.playbackRate = self.media.getPlaybackRate();
                        s2js.Utils.fireEvent(self.element, 'ratechange');
                    },
                    onStateChange: function (e) {
                        self.onPlayerStateChange(self, self.element, e);
                    },
                    onError: function (e) {
                        s2js.Utils.fireEvent(self.element, 'error');
                        // 2 – The request contains an invalid parameter value.
                        // For example, this error occurs if you specify a video
                        // ID that does not have 11 characters, or if the video
                        // ID contains invalid characters, such as exclamation
                        // points or asterisks.

                        // 100 – The video requested was not found. This error
                        // occurs when a video has been removed (for any reason)
                         // or has been marked as private.

                        // 101 – The owner of the requested video does not allow
                        // it to be played in embedded players.

                        // 150 – This error is the same as 101. It's just a 101
                        // error in disguise!
                        console.log('onError', e);
                    }
                }
            });

            return this;
        },
        destroy: function () {
            if (this.hasMedia()) {
                this.element.destroy();
            }
            return this;
        },
        play: function () {
            if (this.hasMedia()) {
                this.media.playVideo();
            }
            return this;
        },
        pause: function () {
            if (this.hasMedia()) {
                this.media.pauseVideo();
            }
            return this;
        },
        mute: function () {
            if (this.hasMedia()) {
                this.media.mute();
                this.muted = true;
            }
            return this;
        },
        unMute: function () {
            if (this.hasMedia()) {
                this.media.unMute();
                this.muted = false;
            }
            return this;
        },
        setCurrentTime: function (seconds) {
            if (this.hasMedia()) {
                this.media.seekTo(seconds);
            }
            return this;
        },

        setVolume: function (volume) {
            if (this.hasMedia()) {
                volume *= 100;
                this.media.setVolume(volume);
                this.volume = Math.round(this.media.getVolume())/100;
            }
            return this;
        },
        setPlaybackRate: function (suggestedRate) {
            if (this.hasMedia()) {
                this.media.setPlaybackRate(suggestedRate);
                this.playbackRate = this.media.getPlaybackRate();
            }
            return this;
        },
        setPlaybackQuality: function (suggestedQuality) {
            if (this.hasMedia()) {
                this.media.setPlaybackQuality(suggestedQuality);
                this.playbackQuality = this.media.getPlaybackQuality();
            }
            return this;
        },
        getAvailableQualityLevels: function () {
            if (this.hasMedia()) {
                return this.media.getAvailableQualityLevels();
            }
        },
        getAvailablePlaybackRates: function () {
            if (this.hasMedia()) {
                return this.media.getAvailablePlaybackRates();
            }
        },
        getPlayerState: function () {
            if (this.hasMedia()) {
                return this.media.getPlayerState();
            }
        },

// ========================================================================== //
        hasMedia: function () {
            return this.media ? true : false;
        },
        updateState: function () {
            var self = this,
                media = this.media,
                update = function (propertyName, newValue, eventName) {
                    if (self[propertyName] !== newValue) {
                        self[propertyName] = newValue;
                        s2js.Utils.fireEvent(self.element, eventName);
                    }
                };

            update('volume', Math.round(media.getVolume())/100, 'volumechange');
            update('muted', media.isMuted(), 'volumechange');
            update('currentTime', media.getCurrentTime(), 'timeupdate');
            update('duration', media.getDuration(), 'durationchange');
        },

        onPlayerStateChange: function (yt, media, event) {
            if (event.data !== null) {
                switch (event.data) {
                    case -1: // not started
                            yt.paused = true;
                            yt.ended = true;
                            s2js.Utils.fireEvent(media, 'loadedmetadata');
                            s2js.Utils.fireEvent(media, 'loadeddata');
                            break;
                    case 0:
                            yt.paused = false;
                            yt.ended = true;
                            s2js.Utils.fireEvent(media, 'ended');
                            break;
                    case 1:
                            yt.paused = false;
                            yt.ended = false;
                            s2js.Utils.fireEvent(media, 'play');
                            s2js.Utils.fireEvent(media, 'playing');
                            break;
                    case 2:
                            s2js.Utils.fireEvent(media, 'pause');
                            break;
                    case 3: // buffering
                            s2js.Utils.fireEvent(media, 'progress');
                            break;
                    case 5:
                            s2js.Utils.fireEvent(media, 'loadstart');
                            console.log('cue');
                            break;
                }
            }
        }

    };

    s2js.API['YoutubeWrapper_'] = YoutubeWrapper;
}(this));
