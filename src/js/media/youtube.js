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

'use strict';
define(['jquery', 'utils', 'metadata'], function ($, Utils, Metadata) {
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
            Metadata.get(self.options.videoId, function (metadata) {
                if (metadata.data && metadata.data.duration) {
                    self.duration = metadata.data.duration;
                    Utils.Utils.fireEvent(videoInstance.element, 'durationchange');
                }
            });
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
                isCalled = true;

                self.setPlaybackRate(self.playbackRate);
                // TODO: call `qualitychange` event 4 times.
                // self.setPlaybackQuality(self.playbackQuality);

                var duration = self.media.getDuration();
                if (videoInstance.duration !== duration) {
                    videoInstance.duration = duration;
                    Utils.Utils.fireEvent(videoInstance.element, 'durationchange');
                }
            };
        } (), false);
    };

    var build = function (videoInstance, element, playerVars) {
        var self = videoInstance,
            elementId = element.attr('id');

        Utils.Utils.fireEvent(self.element, 'loadstart');

        self.media = new YT.Player(elementId, {
            height: '390',
            width: '640',
            videoId: self.options.videoId,
            playerVars: playerVars,
            events: {
                onReady: function (event) {
                    setInterval(updateState.bind(self, self, self.media), 250);
                    Utils.Utils.fireEvent(self.element, 'canplay');
                },
                onPlaybackQualityChange: function (event) {
                    self.playbackQuality = self.media.getPlaybackQuality();
                    Utils.Utils.fireEvent(self.element, 'qualitychange');
                },
                onPlaybackRateChange: function (event) {
                    self.playbackRate = self.media.getPlaybackRate();
                    Utils.Utils.fireEvent(self.element, 'ratechange');
                },
                onStateChange: function (event) {
                    onPlayerStateChange(self, self.element, event);
                },
                onError: function (event) {
                    Utils.Utils.fireEvent(self.element, 'error');
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
                    Utils.debug('info', 'onError' + event);
                }
            }
        });
    };

    var youtubeAPIisLoaded = false;

    var loadAPI = function () {
        if (!youtubeAPIisLoaded) {
            var tag = document.createElement('script'),
                firstScriptTag = document.getElementsByTagName('script')[0];

            tag.src = 'https://www.youtube.com/player_api';
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            youtubeAPIisLoaded = true;
        }
    };

    var updateState = function (videoInstance, media) {
        var setState = function (propertyName, newValue, eventName) {
                if (videoInstance[propertyName] !== newValue) {
                    videoInstance[propertyName] = newValue;
                    Utils.Utils.fireEvent(videoInstance.element, eventName);
                }
            };

        setState('volume', Math.round(media.getVolume())/100, 'volumechange');
        setState('muted', media.isMuted(), 'volumechange');
        setState('currentTime', media.getCurrentTime(), 'timeupdate');
    };

    var onPlayerStateChange = function (yt, media, event) {
        if (event.data !== null) {
            switch (event.data) {
                case -1: // not started
                        yt.paused = true;
                        yt.ended = true;
                        Utils.Utils.fireEvent(media, 'loadedmetadata');
                        Utils.Utils.fireEvent(media, 'loadeddata');
                        break;
                case 0:
                        yt.paused = false;
                        yt.ended = true;
                        Utils.Utils.fireEvent(media, 'ended');
                        break;
                case 1:
                        yt.paused = false;
                        yt.ended = false;
                        Utils.Utils.fireEvent(media, 'play');
                        Utils.Utils.fireEvent(media, 'playing');
                        break;
                case 2:
                        Utils.Utils.fireEvent(media, 'pause');
                        break;
                case 3: // buffering
                        Utils.Utils.fireEvent(media, 'progress');
                        break;
                case 5:
                        Utils.Utils.fireEvent(media, 'loadstart');
                        break;
            }
        }
    };


    var Youtube = function (element, options) {
        initialize.apply(this, Array.prototype.concat.apply(this, arguments));
        Utils.Utils.decorateBy(this, function (method) {
            return function () {
                if (this.media) {
                    return method.apply(this, arguments);
                }
            };
        });
    };

    Youtube.prototype = {
        destroy: function () {
            this.element.destroy();
            return this;
        },
        play: function () {
            this.media.playVideo();
            return this;
        },
        pause: function () {
            this.media.pauseVideo();
            return this;
        },
        mute: function () {
            this.media.mute();
            return this;
        },
        unMute: function () {
            this.media.unMute();
            return this;
        },
        setCurrentTime: function (seconds) {
            this.media.seekTo(seconds);
            return this;
        },
        setVolume: function (volume) {
            volume *= 100;
            this.media.setVolume(volume);
            this.volume = Math.round(this.media.getVolume()) / 100;
            return this;
        },
        setPlaybackRate: function (suggestedRate) {
            this.media.setPlaybackRate(suggestedRate);
            this.playbackRate = this.media.getPlaybackRate();
            return this;
        },
        setPlaybackQuality: function (suggestedQuality) {
            this.media.setPlaybackQuality(suggestedQuality);
            this.playbackQuality = this.media.getPlaybackQuality();
            return this;
        },
        getAvailableQualityLevels: function () {
            return this.media.getAvailableQualityLevels();
        },
        getAvailablePlaybackRates: function () {
            return this.media.getAvailablePlaybackRates();
        },
        getPlayerState: function () {
            return this.media.getPlayerState();
        }
    };

    return Youtube;
});
