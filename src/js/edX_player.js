;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

    s2js.API = {};

    s2js.playerIndex = 0;
    s2js.i18n = {
        t: function (s) { return s; }
    };


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
        className: '',
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
                button = $('<a href="#"></a>'),
                title = s2js.i18n.t(this.titles.normal);

            button
                .attr({
                    role: 'button',
                    title: title
                })
                .addClass([this.classNameDefault, this.className].join(' '))
                .text(title)
                .appendTo(container);

            return button;
        },
        onClickHandler: function (event) {
            this.toggleState();

            event.preventDefault();
        },
        toggleState: function () {
            if (this.element.hasClass(this.classNameActive)) {
                this.normalView();

                if ($.isFunction(this.stateCallbacks.normal)) {
                    this.stateCallbacks.normal.call(this);
                }
            } else {
                this.activeView();

                if ($.isFunction(this.stateCallbacks.active)) {
                    this.stateCallbacks.active.call(this);
                }
            }
        },
        normalView: function () {
            var el = this.element,
                title = s2js.i18n.t(this.titles.normal);

            el
                .removeClass(this.classNameActive)
                .attr('title', title)
                .text(title);
        },
        activeView: function () {
            var el = this.element,
                title = s2js.i18n.t(this.titles.active);

            el
                .addClass(this.classNameActive)
                .attr('title', title)
                .text(title);

        }
    });


    s2js.Slider = s2js.Component.extend({
        className: '',
        classNameDefault: 's2js-slider',
        stateCallbacks: {
            dragStart: null,
            dragMove: null,
            dragEnd: null
        },
        position: {
            x: 0,
            y: 0
        },
        initialize: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);

            this.slider.on({
                'mousedown': this.onMousedownHandler.bind(this),
                'mouseup': this.onMouseupHandler.bind(this)
            });
        },
        build: function (player, media) {
            var container = player.element,
                sliderContainer = $('<div class="s2js-slider-container"></div>'),
                slider = $('<a href="#"></a>'),
                title = s2js.i18n.t('slider');

            slider
                .attr({
                    role: 'slider',
                    title: title
                })
                .addClass([this.classNameDefault, this.className].join(' '))
                .appendTo(sliderContainer);

            sliderContainer
                .appendTo(container);

            this.slider = slider;

            return sliderContainer;
        },
        onMousedownHandler: function (event) {
            this.slider.on('mousemove', this.onMousemoveHandler.bind(this));

            var offset = this.slider.offset(),
                position = this.getPosition();


                this.offset = {
                    x: event.pageX - offset.left + position.x,
                    y: event.pageY - offset.top + position.y
                };

            event.preventDefault();
        },
        onMousemoveHandler: function (event) {
            var offset = this.slider.offset(),
                position = this.getPosition(),
                pos = {
                    x: offset.left - position.x,
                    y: offset.top - position.y
                };

            // this.slider.css({
            //     'transform': this.translate(event.pageX, event.pageY)
            // });

            this.slider[0].style.webkitTransform = this.translate(
                event.pageX - pos.x - this.offset.x,
                0 //|| event.pageY - pos.y - this.offset.y
            );

            event.preventDefault();
        },
        onMouseupHandler: function (event) {
            this.slider.off('mousemove');

            event.preventDefault();
        },
        translate: function (x, y) {
            return 'translate3d( ' + x + 'px, ' + y + 'px, 0)';
        },
        getPosition: function () {
            var value = this.slider[0].style.webkitTransform.toString(),
                pattern = /([0-9-]+)+(?![3d]\()/gi,
                positionMatched = value.match(pattern) || [0, 0, 0];

            return {
                x: parseFloat(positionMatched[0]),
                y: parseFloat(positionMatched[1]),
                z: parseFloat(positionMatched[2])
            };
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
        },
        initialize: function (player, media) {
            s2js.PlayButton.__super__.initialize.apply(this, arguments);
            media.element.addEventListener('play', this.activeView.bind(this), false);
            media.element.addEventListener('pause', this.normalView.bind(this), false);
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
        },
        initialize: function (player, media) {
            s2js.PlayButton.__super__.initialize.apply(this, arguments);
            media.element.addEventListener('volumechange', this.onVolumeChangeHandler.bind(this), false);
        },
        onVolumeChangeHandler: function (event) {
            if (this.media.muted) {
                this.activeView();
            } else {
                this.normalView();
            }
        }
    });

    s2js.VCR = s2js.Component.extend({
        className: 's2js-vcr',
        title: 'vcr',
        initialize: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);

            media.element.addEventListener('timeupdate', this.onUpdateHandler.bind(this), false);
        },
        build: function (player, media) {
            var container = player.element,
                vcr = $('<span>00:00 / 00:00</span>');

            vcr
                .addClass(this.className)
                .appendTo(container);

            return vcr;
        },
        onUpdateHandler: function (event) {
            var value = [
                s2js.Utils.secondsToTimecode(this.media.currentTime),
                s2js.Utils.secondsToTimecode(this.media.duration)
            ].join(' / ');

            this.element.html(value);
            event.preventDefault();
        }
    });


    s2js.Video.plugins = [s2js.VCR, s2js.PlayButton, s2js.MuteButton, s2js.Slider];

}());
