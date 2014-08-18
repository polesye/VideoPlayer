'use strict';
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
            // this.media.setCurrentTime(this.getValue());
        }.bind(this));
        media.element.addEventListener('timeupdate', function () {
            this.setValue(this.media.currentTime);
        }.bind(this));
    }
});
