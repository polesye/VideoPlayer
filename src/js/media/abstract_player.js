AbstractPlayer = {
    initialize: function () {},
    build: function () {},
    destroy: function () {},
    // Plays the media.
    play: function () {},
    // Pauses the currently playing media.
    pause: function () {},
    // Mutes the player.
    mute: function () {},
    // Unmutes the player.
    unMute: function () {},
    // Seeks to a specified time in the video. If the player is paused when the
    // function is called, it will remain paused. If the function is called from
    // another state, the player will play the video.
    setCurrentTime: function (seconds) {},
    // Sets the volume. Accepts an integer between 0 and 100.
    setVolume: function (volume) {},
    // Sets the suggested playback rate for the current video.
    setPlaybackRate: function (suggestedRate) {},
    // {array} Returns the set of playback rates in which the current video is
    // available. The default value is 1, which indicates that the video is
    // playing in normal speed.
    // The function returns an array of numbers ordered from slowest to fastest
    // playback speed. Even if the player does not support variable playback
    // speeds, the array should always contain at least one value (1).
    getAvailablePlaybackRates: function () {},
    // {integer} Returns the state of the player. Possible values are unstarted (-1),
    // ended (0), playing (1), paused (2), buffering (3), video cued (5).
    getPlayerState: function () {},

    // Properties
    // {float} The number of seconds that have been played.
    currentTime: 0,
    // {float} The total number of seconds for the media
    duration: 0,
     // {float} Gets the current volume as a value between 0.0 and 1.0
    volume: 1,
    // {float} Gets  the current playback rate. This may be affected by
    // the user causing the media to play faster or slower.
    playbackRate: 0,
    // {float} Gets or sets the location in the media file, in seconds, where
    // playing should begin.
    startTime: null,
    // {float} Gets or sets the location in the media file, in seconds, where
    // playing should end.
    endTime: null,
    // {boolean} Gets or sets the `autoplay` flag.
    autoplay: false,
    // {boolean} Gets or sets the `controls` attribute, which displays or hides
    // the controls.
    controls: false,
    // {boolean} Gets or sets whether the media should loop back to the start
    // when finished.
    loop: false,
    // {boolean} Gets or sets if the media is muted.
    muted: false,
    // {boolean} Indicates if the player is paused.
    paused: false,
    // {boolean} Indicates if the media has completely played.
    ended: false,
};
