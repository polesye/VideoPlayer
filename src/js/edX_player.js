;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

    var getStyleProperty = function (propName) {
        if (!propName) return;

        var docElemStyle = document.documentElement.style,
            prefixes = 'Webkit Moz ms Ms O'.split(' '),
            prefixed;

        if (typeof docElemStyle[propName] === 'string') {
            return propName;
        }

        propName = propName.charAt(0).toUpperCase() + propName.slice(1);

        for (var i=0, len = prefixes.length; i<len; i++) {
            prefixed = prefixes[i] + propName;

            if (typeof docElemStyle[prefixed] === 'string') {
                return prefixed;
            }
        }
    };

    var transformProperty = getStyleProperty('transform');

    var supportTransform = function (style) {
        var el = document.createElement('div'),
            transforms = {
                'WebkitTransform':'-webkit-transform',
                'OTransform':'-o-transform',
                'MsTransform':'-ms-transform',
                'msTransform':'-ms-transform',
                'MozTransform':'-moz-transform',
                'transform':'transform'
            },
            property = getStyleProperty('transform'),
            t;

        // Add it to the body to get the computed style
        document.body.appendChild(el);
        el.style[property] = style;
        t = window.getComputedStyle(el).getPropertyValue(transforms[property]);
        document.body.removeChild(el);

        return t !== void(0) && t.length > 0 && t !== "none";
    };

    s2js.API = {};

    s2js.playerIndex = 0;

    s2js.i18n = {
        t: function (s) { return s; }
    };

    s2js.support = {
        t2d: supportTransform('translate(1px, 1px)'),
        t3d: supportTransform('translate3d(1px, 1px, 1px)'),
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
        round: function (value, precision) {
            if (typeof precision === 'undefined') {
                precision = 1;
            }

            d = Math.pow(10, precision);

            return Math.round(value * d) / d;
        }
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

            $.each(s2js.Video.plugins, function(index, Component) {
                if (typeof Component === "function") {
                    new Component(player, media);
                } else {
                    throw new TypeError('Component has incorrect type.');
                }
            });
        }
    };

    s2js.Component = function () {};

    s2js.Component.extend = function (protoProps, staticProps) {
        var Parent = this,
            Child;

        if ($.isFunction(protoProps['_constructor'])) {
            Child = function () {
                protoProps['_constructor'].apply(this, arguments);
                if ($.isFunction(this['initialize'])) {
                    this['initialize'].apply(this, arguments);
                }
            };
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
        _constructor: function (player, media) {
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
                .addClass([this.classNameDefault, this.className].join(' '))
                .text(title)
                .attr({
                    role: 'button',
                    title: title
                })
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
        callbacks: {
            start: null,
            slide: null,
            stop: null
        },
        axis: 'x',
        max: 100,
        _position: 0,
        _constructor: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);
            this._styleName = this.axis === 'y' ? 'top' : 'left';

            this.slider.on({
                'mousedown': this.onMousedownHandler.bind(this),
                'click': false
            });
            this.element.on({
                'click': this.onClickHandler.bind(this),
            });

            $(window).resize(this.getSizes.bind(this));
            this.getSizes();
        },
        build: function (player, media) {
            var container = player.element,
                sliderContainer = $('<div class="s2js-slider-container"></div>'),
                slider = $('<a href="#"></a>'),
                range = $('<div class="s2js-slider-range"></div>'),
                title = s2js.i18n.t('slider');

            slider
                .attr({
                    role: 'slider',
                    title: title
                })
                .addClass([this.classNameDefault, this.className].join(' '))
                .appendTo(sliderContainer);

            sliderContainer
                .prepend(range)
                .appendTo(container);

            this.slider = slider;
            this.range = range;

            return sliderContainer;
        },
        onMousedownHandler: function (event) {
            var offset = this.slider.offset();

            this.offset = this.axis === 'y' ?
                event.pageY - offset[this._styleName] :
                event.pageX - offset[this._styleName];

            $(document).on({
                'mousemove.video': this.onMousemoveHandler.bind(this),
                'mouseup': this.onMouseupHandler.bind(this)
            });

            if ($.isFunction(this.callbacks.start)) {
                this.callbacks.start.call(this, this.getPosition());
            }

            event.preventDefault();
        },
        onMousemoveHandler: function (event) {
            var k = this.getCoeff(),
                coord = this.axis === 'y' ? event.pageY : event.pageX,
                position = (coord - this.offset - this.sizes.offset) * k; // px -> %

            position = Math.min(position, 100);
            position = Math.max(position, 0);

            this.setPosition(position);

            if ($.isFunction(this.callbacks.slide)) {
                this.callbacks.slide.call(this, position);
            }

            event.preventDefault();
        },
        onMouseupHandler: function (event) {
            $(document).off('mousemove.video');

            if ($.isFunction(this.callbacks.end)) {
                this.callbacks.end.call(this, this.getPosition());
            }

            event.preventDefault();
        },
        onClickHandler: function (event) {
            var k = this.getCoeff(),
                pagePos = this.axis === 'y' ? event.pageY : event.pageX,
                pos = (pagePos - this.sizes.offset) * k; // px -> %

            this.setPosition(pos);

            if ($.isFunction(this.callbacks.slide)) {
                this.callbacks.slide.call(this, pos);
            }

            event.preventDefault();
        },
        getCoeff: function () {
            return 100/this.sizes.size;
        },
        getPosition: function () {
            return this._position;
        },
        setPosition: function (position) {
            var slider = this.slider[0],
                range = this.range[0],
                styleName = this._styleName;

            position = s2js.Utils.round(position, 2);

            setTimeout(function () {
                slider.style[styleName] = position + '%';
                range.style[this.axis === 'y' ? 'height' : 'width'] = position + '%';
            }, 0);
            this._position = position;
        },
        getValue: function () {
            return s2js.Utils.round(this.getPosition() * this.max / 100, 2);
        },
        setValue: function (value) {
            var position = 100 * value / this.max;

            this.setPosition(position);
        },
        getSizes: function () {
            var el = this.element,
                isAxisY = this.axis === 'y';

            this.sizes = {
                size: isAxisY ? el.height() : el.width(),
                offset: isAxisY ? el.offset().top : el.offset().left
            };
        },
        setMaxValue: function (value) {
            this.max = value;
        }
    });


    s2js.Menu = s2js.Component.extend({
        className: 's2js-menu',
        _constructor: function () { }
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
        _constructor: function (player, media) {
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

    s2js.ProgressSlider = s2js.Slider.extend({
        callbacks: {
            start: null,
            slide: function (position) {
                this.media.setCurrentTime(this.getValue());
            },
            stop: null
        },
        initialize: function (player, media) {
            media.element.addEventListener('durationchange', function () {
                this.setMaxValue(this.media.duration);
                this.media.setCurrentTime(this.getValue());
            }.bind(this));
            media.element.addEventListener('timeupdate', function () {
                this.setValue(this.media.currentTime);
            }.bind(this));
        }
    });

    s2js.Transcripts = s2js.Component.extend({
        _constructor: function (player, media) {
            var container = player.element,
                transcripts = this.element = $('<ol class="s2js-transcripts" />'),
                title = s2js.i18n.t('transcripts');

            this.srt = new SubRip(txt);
            var items = this.generateItems(this.srt._subripArray);

            this.element
                .append(items)
                .appendTo(container);

            this.items = this.element.find('li');

            media.element.addEventListener('timeupdate', function () {
                this.setItemBySeconds(media.currentTime);
            }.bind(this));

            this.element.on('click', 'li', function (event) {
                var index = $(event.currentTarget).index();

                this.setItemByIndex(index);
                media.setCurrentTime(this.srt._subripArray[index].start);
            }.bind(this));
        },
        generateItems: function (array) {
            var frag = document.createDocumentFragment();

            $.each(array, function(index, SubRipItem) {
                var item = $('<li class="s2js-transcripts-item" />');

                item.text(SubRipItem.text);

                frag.appendChild(item[0]);
            });

            return [frag];
        },
        setItemBySeconds: function (seconds) {
            var SubRipObject = this.srt.search(seconds);

            if (SubRipObject) {
                var index = SubRipObject.id - 1;

                this.setItemByIndex(index);
            } else {
                this.items.removeClass('s2js-transcripts-item-active');
            }
        },
        setItemByIndex: function (index) {
            this.items
                .removeClass('s2js-transcripts-item-active')
                .eq(index)
                .addClass('s2js-transcripts-item-active');
        }
    });

    s2js.Video.plugins = [s2js.VCR, s2js.PlayButton, s2js.MuteButton, s2js.ProgressSlider, s2js.Transcripts];

}());
