'use strict';
define(['jquery', 'utils'], function ($, Utils) {
    var Runtime = function (player, media) {

        this.getPlayer = function () {
            return player;
        };

        this.getMedia = function () {
            return media;
        };
    };

    Runtime.prototype.$ = $;

    return Runtime;
});
