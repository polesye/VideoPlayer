;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

    s2js.API = {};

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
                event.initEvent(eventName, true, true);
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
            if (typeof s2js.API[type] !== "function") {
                throw new TypeError(type + ' is not a function.');
            }

            this.media = new s2js.API[type](element, options);
            this.initializePlugins();

            return this.media;
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

            $.extend(true, Child, staticProps);

            // inherit
            var F = function () {};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.__super__ = Parent.prototype;

            if (protoProps) {
                $.extend(true, Child.prototype, protoProps);
            }

            return Child;
        }
    };

    s2js.Button = s2js.Component.extend({
        className: 's2js-button',
        classNameActive: 's2js-button-active',
        title: ['Play button', 'Pause button'],
        initialize: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);

            this.element.addEventListener('click', this.onClick.bind(this), false);
        },
        build: function (player, media) {
            var container = player.element,
                button = document.createElement('a');

            button.setAttribute('role', 'button');
            button.href = '#';
            button.title = this.title[0];
            button.innerHTML = this.title[0];
            button.className = this.className;

            container.parentNode.appendChild(button);

            return button;
        },
        onClick: function (event) {
            this.toggleState();

            event.preventDefault();
        },
        toggleState: function () {
            var el = this.element;
            if (el.classList.contains(this.classNameActive)) {
                el.classList.remove(this.classNameActive);
                el.innerHTML = el.title = this.title[0];
                this.media.pause();
            } else {
                el.classList.add(this.classNameActive);
                el.innerHTML = el.title = this.title[1];
                this.media.play();
            }
        }
    });

    s2js.Menu = s2js.Component.extend({
        className: 's2js-menu',
        initialize: function () { }
    });




    s2js.Video.plugins = [s2js.Button];

}());
