// Format
// Each frame of a subtitle is formatted as follows:
// n
// h1:m1:s1,d1 --> h2:m2:s2,d2
// Line 1
// Line 2
// ...
// (blank line between subtitle frames)
// n = sequential number. This may also appear on the same line as start/stop times.
// h1:m1:s1,d1 = start time of this frame, in hours minutes and seconds to three decimal places.
// h2:m2:s2,d2 = stop time.
// Note the French-style comma for the decimal delimiter.
// Extensions
// Some subtitles feature html tags inside the SubRip text:
// <b>...</b>: bold
// <s>...</s>: strikethrough
// <u>...</u>: underline
// <i>...</i>: italic
// <font color=... face=...>: font attributes


define(['utils'], function (Utils) {
    'use strict';
    var SubRip = function (srt) {
        this._subripArray = this.parse(srt);
    };

    SubRip.prototype = {
        // timestampRegExp: /^(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s--\>\s(\d{2}):(\d{2}):(\d{2})[.,](\d{3})(\s{2}X1:(\d{3})\sX2:(\d{3})\sY1:(\d{3})\sY2:(\d{3}))?$/,
        timestampRe: /^(?:\d+\s)?(\d{2}:\d{2}\:\d{2}[.,]\d{3})\s--\>\s(\d{2}:\d{2}\:\d{2}[.,]\d{3})(.*)$/,
        parse: function (content) {
            var lines = content.split(/\r\n|\r|\n/),
                linesCount = lines.length,
                entries = [], i = 0, id = 0,
                line, timestamp, text;

            Utils.debug('info', 'lines count: ' + linesCount);
            Utils.timeStart('parsing');
            for (; i < linesCount; i+=1) {
                line = lines[i].trim();
                timestamp = this.timestampRe.exec(line);

                if (timestamp) {
                    id += 1;
                    text = '';

                    // Loop until a blank line or end of lines
                    // (grab all the (possibly multi-line) text that follows)
                    while(lines[++i] && lines[i].trim() !== '') {
                        // String concatination is in 2 times faster than [].join('\n')
                        text += '\n' + lines[i];
                    }

                    entries.push({
                        id: id,
                        start: s2js.Utils.timecodeToSeconds(timestamp[1]),
                        end: s2js.Utils.timecodeToSeconds(timestamp[2]),
                        text: text,
                        settings: timestamp[3]
                    });
                }
            }
            Utils.timeEnd('parsing');
            return entries;
        },

        search: function (seconds) {
            Utils.timeStart('search');
            var arr = this._subripArray,
                min = 0,
                max = arr.length - 1,
                mid, start, end;

            var time = Date.now();
            search:
            while (min < max) {
                if (Date.now() - time > 2000) {
                    break search;
                }
                mid = Math.ceil((max + min)/2);
                start = arr[mid].start;
                end = arr[mid].end;

                if (start > seconds) {
                    max = mid;
                } else if (end < seconds) {
                    min = mid;
                } else if (start <= seconds && end >= seconds) {
                    Utils.timeEnd('search');
                    return arr[mid];
                } else {
                    Utils.timeEnd('search');
                    return void(0);
                }

            }
            Utils.timeEnd('search');
            return void(0);
        },

        getTextBySeconds: function (seconds) {
            return this.search(seconds) || '';
        }
    };

    return SubRip;
};
