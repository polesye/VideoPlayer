;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

    s2js.API = {};

    s2js.playerIndex = 0;

    s2js.Utils = {
        printf: function (format) {
            var args = Array.prototype.slice.call(arguments, 1);

            return format.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        },
        escapeHTML: function(s) {
            return s.toString()
                    .split('&').join('&amp;')
                    .split('<').join('&lt;')
                    .split('"').join('&quot;');
        },
        secondsToTimecode: function(time, forceHours) {
            var hours = Math.floor(time / 3600) % 24,
                minutes = Math.floor(time / 60) % 60,
                seconds = Math.floor(time % 60),
                pad = function (value) {
                    return (value < 10) ? '0' + value : value;
                },
                result = (
                    (forceHours || hours > 0) ? pad(hours) + ':' : '') +
                    pad(minutes) + ':' + pad(seconds);

            return result;
        },
        timecodeToSeconds: function(hhmmss){
            var array = hhmmss.split(":"),
                hours = parseInt(array[0], 10),
                minutes = parseInt(array[1], 10),
                seconds = parseInt(array[2], 10);

            seconds += (hours * 3600) + (minutes * 60);

            return seconds;
        },
        fireEvent: function (el, eventName, data) {
            var event;

            if (document.CustomEvent) {
                event = document.CustomEvent(eventName, {"detail": data});
            } else if (document.createEvent) {
                event = document.createEvent('HTMLEvents');
                event.initEvent(eventName, true, true, data);
            } else {
                event = document.createEventObject();
                event.eventType = eventName;
            }

            event.eventName = eventName;

            if (document.CustomEvent || document.createEvent) {
                el.dispatchEvent(event);
            } else {
                el.fireEvent('on' + event.eventType, event);
            }
        },
    };

    s2js.Video = function (type, element, options) {
        this.element = element[0];
        return this.initialize.apply(this, arguments);
    };

    s2js.Video.prototype = {
        initialize: function (type, element, options) {
            var slice = Array.prototype.slice,
                videoHolder = this.build.apply(this, slice.call(arguments, 1));

            if (typeof s2js.API[type] !== "function") {
                throw new TypeError(type + ' is not a function.');
            }

            this.media = new s2js.API[type](videoHolder, options);
            this.initializePlugins();
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

        initializePlugins: function () {
            var player = this,
                media = this.media;

            $.each(s2js.Video.plugins, function(index, plugin) {
                if (typeof plugin === "function") {
                    new plugin(player, media);
                } else {
                    throw new TypeError('Plugin has incorrect type.');
                }
            });
        }
    };


    s2js.Component = {
        extend: function (protoProps, staticProps) {
            var Parent = this,
                Child;

            if ($.isFunction(protoProps['initialize'])) {
                Child = protoProps['initialize'];
            } else {
                Child = function () { return Parent.apply(this, arguments); };
            }

            $.extend(Child, Parent, staticProps);

            // inherit
            var F = function () {};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.constructor = Parent;
            Child.__super__ = Parent.prototype;

            if (protoProps) {
                $.extend(Child.prototype, protoProps);
            }

            return Child;
        }
    };

    s2js.Button = s2js.Component.extend({
        className: 's2js-button-play',
        classNameDefault: 's2js-button',
        classNameActive: 's2js-button-active',
        titles: {
            normal: 'button',
            active: 'button active'
        },
        stateCallbacks: {
            normal: null,
            active: null
        },
        initialize: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);

            this.element.on('click', this.onClickHandler.bind(this));
        },
        build: function (player, media) {
            var container = player.element,
                button = $('<a href="#"></a>');

            button
                .attr({
                    role: 'button',
                    title: this.titles.normal
                })
                .addClass(this.classNameDefault)
                .addClass(this.className)
                .text(this.titles.normal)
                .appendTo(container);

            return button;
        },
        onClickHandler: function (event) {
            this.toggleState();

            event.preventDefault();
        },
        toggleState: function () {
            var el = this.element;
            if (el.hasClass(this.classNameActive)) {
                el
                    .removeClass(this.classNameActive)
                    .attr('title', this.titles.normal)
                    .text(this.titles.normal);

                if ($.isFunction(this.stateCallbacks.normal)) {
                    this.stateCallbacks.normal.call(this);
                }
            } else {
                el
                    .addClass(this.classNameActive)
                    .attr('title', this.titles.active)
                    .text(this.titles.active);

                if ($.isFunction(this.stateCallbacks.active)) {
                    this.stateCallbacks.active.call(this);
                }
            }
        }
    });

    s2js.Menu = s2js.Component.extend({
        className: 's2js-menu',
        initialize: function () { }
    });



// ========================================================================== //



    s2js.PlayButton = s2js.Button.extend({
        className: 's2js-button-play',
        titles: {
            normal: 'Play',
            active: 'Pause'
        },
        stateCallbacks: {
            normal: function () {
                this.media.pause();
            },
            active: function () {
                this.media.play();
            }
        }
    });

    s2js.MuteButton = s2js.Button.extend({
        className: 's2js-button-mute',
        titles: {
            normal: 'Mute',
            active: 'unMute'
        },
        stateCallbacks: {
            normal: function () {
                this.media.unMute();
            },
            active: function () {
                this.media.mute();
            }
        }
    });


    s2js.Video.plugins = [s2js.PlayButton, s2js.MuteButton];

}());
