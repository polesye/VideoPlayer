'use strict';
define([
    'utils', 'components/component'
], function (Utils, Component) {
    var VCR = Component.extend({
        className: 's2js-vcr',
        title: 'vcr',
        _constructor: function (runtime) {
            this.runtime = runtime;
            this.player = runtime.getPlayer();
            this.media = runtime.getMedia();
            this.element = this.build();

            this.media.element.addEventListener('timeupdate', this.onUpdateHandler.bind(this), false);
            this.media.element.addEventListener('durationchange', this.onUpdateHandler.bind(this), false);
        },

        build: function (runtime) {
            var container = this.player.element,
                vcr = this.runtime.$('<span />', {
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
