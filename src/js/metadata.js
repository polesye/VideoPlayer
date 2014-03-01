;(function () {
    "use strict";

    window.jsonpCallbacks = window.jsonpCallbacks || {};

    var jsonp = function (url, options) {
        console.time('jsonp');
        var config = $.extend({
                timeout: null,
                success: null,
                error: null
            }, options),
            script = document.createElement('script'),
            callback = 'callback_' + Math.random().toString(32).slice(2),
            isSuccess = false,
            timer;

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
            console.timeEnd('jsonp');
        };

        var handleRequest = function () {
            if (!isSuccess) {
                handleError();
            }
        };

        jsonpCallbacks[callback] = function(data) {
            clearTimeout(timer);
            removeCallback();

            isSuccess = true;

            if (config.success) {
                config.success(data);
            }
            console.timeEnd('jsonp');
        };

        if (config.timeout) {
            timer = setTimeout(function () {
                handleError();
            }, config.timeout);
        }

        script.onreadystatechange = function() {
            if (script.readyState === 'complete' || script.readyState === 'loaded'){
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
        get: function (videoId, success, error) {
            var url = [
                    'https://gdata.youtube.com/feeds/api/videos/',
                    videoId,
                    '?v=2&alt=jsonc'
                ].join('');
            // var url = 'http://127.0.0.1:3000';
            jsonp(url, {
                timeout: 2000,
                success: success,
                error: error
            });
        }
    };

    window['Metadata'] = Metadata;
}());
