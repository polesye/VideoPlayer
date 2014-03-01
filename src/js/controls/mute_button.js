s2js.MuteButton = s2js.Button.extend({
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
    initialize: function (player, media) {
        media.element.addEventListener('volumechange', this.onVolumeChangeHandler.bind(this), false);
    },
    onVolumeChangeHandler: function (event) {
        if (this.media.muted) {
            this.activeView();
        } else {
            this.normalView();
        }
    }
});
