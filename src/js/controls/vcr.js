'use strict';
define([
    'jquery', 'utils', 'components/component'
], function ($, Utils, Component) {
    var VCR = Component.extend({
        className: 's2js-vcr',
        title: 'vcr',
        _constructor: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);

            media.element.addEventListener('timeupdate', this.onUpdateHandler.bind(this), false);
            media.element.addEventListener('durationchange', this.onUpdateHandler.bind(this), false);
        },

        build: function (player, media) {
            var container = player.element,
                vcr = $('<span />', {
                    'class': this.className,
                    'text': '00:00 / 00:00'
                });

            return vcr.appendTo(container);
        },

        onUpdateHandler: function (event) {
            var value = [
                Utils.Utils.secondsToTimecode(this.media.currentTime),
                Utils.Utils.secondsToTimecode(this.media.duration)
            ].join(' / ');

            this.element.html(value);
            event.preventDefault();
        }
    });

    return VCR;
});
