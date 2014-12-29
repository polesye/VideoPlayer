'use strict';
define([
    'utils', 'components/component'
], function (Utils, Component) {
    var Transcripts = Component.extend({
        _constructor: function (runtime) {
            this.runtime = runtime;
            this.player = runtime.getPlayer();
            this.media = runtime.getMedia();

            var container = this.player.element,
                transcripts = this.element = this.runtime.$('<ol class="s2js-transcripts" />'),
                title = Utils.i18n.t('transcripts');

            this.runtime.$.ajax({
                url: 'http://localhost:3000/srt',
                success: function (response) {
                    this.build(container, response);
                }.bind(this)
            });
        },

        build: function (container, content) {
            this.srt = new SubRip(content);
            var items = this.generateItems(this.srt._subripArray);

            this.element
                .append(items)
                .appendTo(container);
            this.items = this.element.find('li');

            this.media.element.addEventListener('timeupdate', function () {
                this.setItemBySeconds(this.media.currentTime);
            }.bind(this));

            this.element.on('click', 'li', function (event) {
                var index = this.runtime.$(event.currentTarget).index();
                this.media.setCurrentTime(this.srt._subripArray[index].start);
            }.bind(this));
        },

        generateItems: function (array) {
            var frag = document.createDocumentFragment();
            this.runtime.$.each(array, function(index, SubRipItem) {
                var item = this.runtime.$('<li />', {'class': 's2js-transcripts-item'});
                item.text(SubRipItem.text);
                frag.appendChild(item[0]);
            });

            return [frag];
        },

        setItemBySeconds: function (seconds) {
            var SubRip = this.srt.search(seconds);
            if (SubRip) {
                this.setItemByIndex(SubRip.id - 1);
            } else {
                this.items.removeClass('s2js-transcripts-item-active');
            }
        },

        setItemByIndex: function (index) {
            this.items
                .removeClass('s2js-transcripts-item-active')
                .eq(index)
                .addClass('s2js-transcripts-item-active');
        }
    });

    return Transcripts;
});
