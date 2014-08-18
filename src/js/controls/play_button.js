'use strict';
s2js.PlayButton = s2js.Button.extend({
    className: 's2js-button-play',
    titles: {
        normal: 'Play',
        active: 'Pause'
    },

    stateCallbacks: {
        normal: function () {
            this.media.pause();
        },
        active: function () {
            this.media.play();
        }
    },

    initialize: function (player, media) {
        media.element.addEventListener('play', this.activeView.bind(this), false);
        media.element.addEventListener('pause', this.normalView.bind(this), false);
    }
});
