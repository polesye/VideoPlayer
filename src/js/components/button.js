'use strict';
define([
    'jquery', 'utils', 'components/component'
], function ($, Utils, Component) {
    var Button = Component.extend({
        className: '',
        classNameDefault: 's2js-button',
        classNameActive: 's2js-button-active',
        titles: {
            normal: 'button',
            active: 'button active'
        },
        stateCallbacks: {
            normal: null,
            active: null
        },
        _constructor: function (player, media) {
            this.player = player;
            this.media = media;
            this.element = this.build.apply(this, arguments);
            this.element.on('click', this.onClickHandler.bind(this));
        },
        build: function (player, media) {
            var container = player.element,
                button = $('<a href="#"></a>'),
                title = Utils.i18n.t(this.titles.normal);

            button
                .addClass([this.classNameDefault, this.className].join(' '))
                .text(title)
                .attr({
                    role: 'button',
                    title: title
                })
                .appendTo(container);

            return button;
        },
        onClickHandler: function (event) {
            this.toggleState();
            event.preventDefault();
        },
        toggleState: function () {
            if (this.element.hasClass(this.classNameActive)) {
                this.normalView();

                if ($.isFunction(this.stateCallbacks.normal)) {
                    this.stateCallbacks.normal.call(this);
                }
            } else {
                this.activeView();

                if ($.isFunction(this.stateCallbacks.active)) {
                    this.stateCallbacks.active.call(this);
                }
            }
        },
        normalView: function () {
            var title = Utils.i18n.t(this.titles.normal);

            this.element
                .removeClass(this.classNameActive)
                .attr('title', title)
                .text(title);
        },
        activeView: function () {
            var title = Utils.i18n.t(this.titles.active);

            this.element
                .addClass(this.classNameActive)
                .attr('title', title)
                .text(title);

        }
    });

    return Button;
});
