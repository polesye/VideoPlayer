'use strict';
window.s2js = window.s2js || {};
var debug = function(type, message) {
    console.log.call(console, arguments[0] + ':', Array.prototype.slice.call(arguments, 1));
};

var timeStart = function (name) {
    console.time(name);
};

var timeEnd = function (name) {
    console.timeEnd(name);
};

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

    return t !== void(0) && t.length > 0 && t !== 'none';
};

s2js.support = {
    // t2d: supportTransform('translate(1px, 1px)'),
    // t3d: supportTransform('translate3d(1px, 1px, 1px)'),
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
            result = ((forceHours || hours > 0) ? pad(hours) + ':' : '') +
                pad(minutes) + ':' + pad(seconds);

        return result;
    },

    timecodeToSeconds: function(hhmmss){
        var array = hhmmss.split(':'),
            hours = parseInt(array[0], 10),
            minutes = parseInt(array[1], 10),
            seconds = parseInt(array[2], 10);

        return seconds + (hours * 3600) + (minutes * 60);
    },

    fireEvent: function (el, eventName, data) {
        var event;

        if (document.CustomEvent) {
            event = document.CustomEvent(eventName, {'detail': data});
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
        var d;

        if (typeof precision !== 'number') {
            precision = 1;
        }

        d = Math.pow(10, precision);
        return Math.round(value * d) / d;
    },

    isFunction: function (value) {
        return typeof value === 'function';
    },

    uniqueId: function () {
        var counter = 0;
        return function (prefix) {
            counter++;
            return (prefix) ? prefix + counter : counter;
        };
    }()
};

