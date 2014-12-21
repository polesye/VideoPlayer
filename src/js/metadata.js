'use strict';
define(['jquery', 'utils'], function ($, Utils) {
    window.jsonpCallbacks = window.jsonpCallbacks || {};
    // params:
    // timeout - waiting time;
    // success - callback for successful case;
    // error - callback for error case.
    var jsonp = function (url, options) {
        Utils.timeStart('jsonp');
        var config = $.extend({
                timeout: null,
                success: null,
                error: null
            }, options),
            script = document.createElement('script'),
            callback = 'callback_' + Math.random().toString(32).slice(2),
            isSuccessfulRequest = false, timer;

        url += url.indexOf('?') === -1 ? '?' : '&';
        url += 'callback=jsonpCallbacks.' + callback;

        var removeCallback = function () {
            delete jsonpCallbacks[callback];
        };

        var handleError = function () {
            removeCallback();
            if (config.error) {
                config.error(url);
            }
            Utils.timeEnd('jsonp');
        };

        var handleRequest = function () {
            if (!isSuccessfulRequest) {
                handleError();
            }
        };

        window.jsonpCallbacks[callback] = function(data) {
            clearTimeout(timer);
            removeCallback();
            isSuccessfulRequest = true;
            if (config.success) {
                config.success(data);
            }
            Utils.timeEnd('jsonp');
        };

        if (config.timeout) {
            timer = setTimeout(function () {
                handleError();
            }, config.timeout);
        }

        script.onreadystatechange = function() {
            if (script.readyState === 'complete' || script.readyState === 'loaded') {
                script.onreadystatechange = null;
                setTimeout(handleRequest, 0);
            }
        };

        script.onload = script.onerror = handleRequest;
        script.src = url;

        document.body.appendChild(script);
        document.body.removeChild(script);
    };

    var Metadata = {
        url: function (videoId) {
            return [
                'https://gdata.youtube.com/feeds/api/videos/', videoId, '?v=2&alt=jsonc'
            ].join('');
        },

        get: function (videoId, success, error) {
            var url = this.url(videoId);
            // var url = 'http://127.0.0.1:3000';
            jsonp(url, {
                timeout: 2000,
                success: success,
                error: error
            });
        }
    };

    return Metadata;
});
