'use strict';
define([
    'utils', 'components/component'
], function (Utils, Component) {
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
        _constructor: function (runtime) {
            this.runtime = runtime;
            this.player = runtime.getPlayer();
            this.media = runtime.getMedia();
            this.element = this.build();
            this.element.on('click', this.onClickHandler.bind(this));
        },
        build: function () {
            var container = this.player.element,
                button = this.runtime.$('<a href="#"></a>'),
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

                if (this.runtime.$.isFunction(this.stateCallbacks.normal)) {
                    this.stateCallbacks.normal.call(this);
                }
            } else {
                this.activeView();

                if (this.runtime.$.isFunction(this.stateCallbacks.active)) {
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
