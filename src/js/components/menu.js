'use strict';
define([
    'utils', 'components/component'
], function (Utils, Component) {
    var Menu = Component.extend({
        className: 's2js-menu',
        classNameItem: 's2js-menu-item',
        classNameItemActive: 'is-active',
        items: [],

        stateCallbacks: {
            normal: null,
            active: null
        },

        _constructor: function (runtime) {
            this.runtime = runtime;
            this.player = runtime.getPlayer();
            this.media = runtime.getMedia();
            var self = this;
            this.media.element.addEventListener('play', function () {
                var isCalled = false;

                return function () {
                    if (isCalled) return;
                    isCalled = true;
                    self.items = runtime.getMedia().getAvailableQualityLevels();
                    self.element = self.build();
                    self.element.on('click', 'a', self.onClickHandler.bind(self));
                };
            } ());
            this.media.element.addEventListener('qualitychange', function () {
                var quality = runtime.getMedia().playbackQuality,
                    element;

                if (self.element) {
                    element = self.element.find('[data-value="'+ quality +'"]');
                    self.updateView(element);
                }
            });
        },

        build: function () {
            var container = this.player.element,
                menu = this.createMenu(this.items);

            menu.appendTo(container);
            return menu;
        },

        createMenu: function (items) {
            var menu = this.runtime.$('<ul />', {
                'class': this.className
            });

            this.runtime.$.each(items, function (index, item) {
                menu.append(this.createItem(item));
            }.bind(this));

            return menu;
        },

        createItem: function (text) {
            return this.runtime.$('<li />', {
                'class': this.classNameItem,
                'data-value': text
            }).append(this.runtime.$('<a />', {
                'href': '#',
                'text': text
            }));
        },

        onClickHandler: function (event) {
            var element = this.runtime.$(event.target).parent(),
                quality = this.runtime.$(event.target).text();

            this.updateView(element);
            this.media.setPlaybackQuality(quality);
            event.preventDefault();
        },

        updateView: function (element) {
            element
                .addClass(this.classNameItemActive)
                .siblings()
                .removeClass(this.classNameItemActive);
        }
    });

    return Menu;
});
