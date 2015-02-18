'use strict';
define([
    'utils', 'components/component'
], function (Utils, Component) {
    var Aggregator = Component.extend({
        initialize: function (runtime) {
            this.runtime = runtime;
            this.player = runtime.getPlayer();
            this.media = runtime.getMedia();
            this.children = [];
        },

        addChild: function (child) {
            this.children.push(child);
        },

        destroy: function () {
            this.children = null;
        }
    });

    return Aggregator;
});
