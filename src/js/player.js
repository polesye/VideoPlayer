'use strict';
define([
    'jquery', 'utils', 'runtime.v1', 'media/html5', 'media/youtube'
], function ($, Utils, Runtime, HTML5, Youtube) {
    var API = {
        HTML5: HTML5,
        Youtube: Youtube
    };

    var Video = function (type, element, options) {
        this.element = element[0];
        return this.initialize.apply(this, arguments);
    };

    Video.prototype = {
        initialize: function (type, element, options) {
            var slice = Array.prototype.slice,
                videoHolder = this.build.apply(this, slice.call(arguments, 1));

            if (!Utils.Utils.isFunction(API[type])) {
                throw new TypeError(type + ' is not a function.');
            }

            this.options = $.extend({}, {plugins: []}, options);
            this.media = new API[type](videoHolder, options);
            this.initializeComponents();

            return this.media;
        },

        build: function (element, options) {
            return $('<div />', {'class': 'video-holder'})
                .attr('id', Utils.Utils.uniqueId('s2js-player-'))
                .appendTo(element.addClass('s2js-player'));
        },

        initializeComponents: function () {
            var runtime = new Runtime(this, this.media);

            $.each(this.options.plugins, function(index, Component) {
                if (Utils.Utils.isFunction(Component)) {
                    new Component(runtime);
                } else {
                    throw new TypeError('Component has incorrect type.');
                }
            });
        }
    };

    // Video.plugins = [VCR, PlayButton, MuteButton, ProgressSlider, Transcripts];
    return Video;
});
