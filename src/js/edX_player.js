;(function (undefined) {
    window['s2js'] = window['s2js'] || {};

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
    };

}());
