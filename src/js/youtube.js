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
    var initialize = function (videoInstance, element, config) {
        var self = videoInstance,
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

        $.extend(self, {
            options: $.extend({}, defaults, options),
            currentTime: 0,
            duration: 0, // NaN in html5
            paused: true,
            ended: false
        }, defaultProperties, properties);

        playerVars = $.extend({}, defaultPlayerVars, playerVars);

        window.onYouTubePlayerAPIReady = function () {
            build.call(null, self, element, playerVars);
        };

        loadAPI();
        self.element = element[0];

        self.element.addEventListener('canplay', function () {
            if (self.muted) {
                self.mute();
            } else {
                self.unMute();
            }

            self.setVolume(self.volume);
        }, false);

        self.element.addEventListener('play', function () {
            var isCalled = false;

            return function () {
                if (isCalled) return;

                self.setPlaybackRate(self.playbackRate);
                // TODO: call `qualitychange` event 4 times.
                self.setPlaybackQuality(self.playbackQuality);
            };
        } (), false);
    };

    var build = function (videoInstance, element, playerVars) {
        var self = videoInstance,
            elementId = element.attr('id');

        s2js.Utils.fireEvent(self.element, 'loadstart');

        self.media = new YT.Player(elementId, {
            height: '390',
            width: '640',
            videoId: self.options.videoId,
            playerVars: playerVars,
            events: {
                onReady: function (e) {
                    setInterval(updateState.bind(self, self, self.media), 250);
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
                    onPlayerStateChange(self, self.element, e);
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
    };

    var loadAPI = function () {
        if (!s2js.youtubeAPIisLoaded) {
            var tag = document.createElement('script'),
                firstScriptTag = document.getElementsByTagName('script')[0];

            tag.src = "https://www.youtube.com/player_api";
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            s2js.youtubeAPIisLoaded = true;
        }
    };

    var updateState = function (videoInstance, media) {
        var setState = function (propertyName, newValue, eventName) {
                if (videoInstance[propertyName] !== newValue) {
                    videoInstance[propertyName] = newValue;
                    s2js.Utils.fireEvent(videoInstance.element, eventName);
                }
            };

        setState('volume', Math.round(media.getVolume())/100, 'volumechange');
        setState('muted', media.isMuted(), 'volumechange');
        setState('currentTime', media.getCurrentTime(), 'timeupdate');
        setState('duration', media.getDuration(), 'durationchange');
    };

    var onPlayerStateChange = function (yt, media, event) {
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
    };


    var Youtube = function (element, options) {
        initialize.apply(self, Array.prototype.concat.apply(this, arguments));
    };

    Youtube.prototype = {
        destroy: function () {
            if (this.media) {
                this.element.destroy();
            }
            return this;
        },
        play: function () {
            if (this.media) {
                this.media.playVideo();
            }
            return this;
        },
        pause: function () {
            if (this.media) {
                this.media.pauseVideo();
            }
            return this;
        },
        mute: function () {
            if (this.media) {
                this.media.mute();
            }
            return this;
        },
        unMute: function () {
            if (this.media) {
                this.media.unMute();
            }
            return this;
        },
        setCurrentTime: function (seconds) {
            if (this.media) {
                this.media.seekTo(seconds);
            }
            return this;
        },
        setVolume: function (volume) {
            if (this.media) {
                volume *= 100;
                this.media.setVolume(volume);
                this.volume = Math.round(this.media.getVolume())/100;
            }
            return this;
        },
        setPlaybackRate: function (suggestedRate) {
            if (this.media) {
                this.media.setPlaybackRate(suggestedRate);
                this.playbackRate = this.media.getPlaybackRate();
            }
            return this;
        },
        setPlaybackQuality: function (suggestedQuality) {
            if (this.media) {
                this.media.setPlaybackQuality(suggestedQuality);
                this.playbackQuality = this.media.getPlaybackQuality();
            }
            return this;
        },
        getAvailableQualityLevels: function () {
            if (this.media) {
                return this.media.getAvailableQualityLevels();
            }
        },
        getAvailablePlaybackRates: function () {
            if (this.media) {
                return this.media.getAvailablePlaybackRates();
            }
        },
        getPlayerState: function () {
            if (this.media) {
                return this.media.getPlayerState();
            }
        }
    };

    s2js.API['Youtube'] = Youtube;
}(this));
