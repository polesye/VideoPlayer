'use strict';
define(['components/slider'], function (Slider) {
    var ProgressSlider = Slider.extend({
        callbacks: {
            start: function () {
                this.media.element.removeEventListener('timeupdate', this.onTimeUpdate);
            },
            slide: function () {
                this.media.setCurrentTime(this.getValue());
            },
            stop: function () {
                this.media.element.addEventListener('timeupdate', this.onTimeUpdate);
            }
        },

        initialize: function (runtime) {
            this.onTimeUpdate = this.onTimeUpdate.bind(this);
            this.media.element.addEventListener('durationchange', function () {
                this.setMaxValue(runtime.getMedia().duration);
                // this.media.setCurrentTime(this.getValue());
            }.bind(this));
            this.media.element.addEventListener('timeupdate', this.onTimeUpdate);
        },

        onTimeUpdate: function () {
            this.setValue(this.runtime.getMedia().currentTime);
        }
    });

    return ProgressSlider;
});
