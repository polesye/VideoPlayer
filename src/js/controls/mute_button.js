'use strict';
define(['components/button'], function (Button) {
    var MuteButton = Button.extend({
        className: 's2js-button-mute',
        titles: {
            normal: 'Mute',
            active: 'unMute'
        },

        stateCallbacks: {
            normal: function () {
                this.media.unMute();
            },
            active: function () {
                this.media.mute();
            }
        },

        initialize: function (runtime) {
            this.media.element.addEventListener('volumechange', this.onVolumeChangeHandler.bind(this), false);
            this.updateState();
        },

        onVolumeChangeHandler: function (event) {
            this.updateState();
        },

        updateState: function () {
            if (this.media.muted) {
                this.activeView();
            } else {
                this.normalView();
            }
        }
    });

    return MuteButton;
});
