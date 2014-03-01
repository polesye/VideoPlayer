s2js.Transcripts = s2js.Component.extend({
    _constructor: function (player, media) {
        this.player = player;
        this.media = media;

        var container = player.element,
            transcripts = this.element = $('<ol class="s2js-transcripts" />'),
            title = s2js.i18n.t('transcripts');

        $.ajax({
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
            var index = $(event.currentTarget).index();

            this.media.setCurrentTime(this.srt._subripArray[index].start);
        }.bind(this));
    },
    generateItems: function (array) {
        var frag = document.createDocumentFragment();

        $.each(array, function(index, SubRipItem) {
            var item = $('<li class="s2js-transcripts-item" />');

            item.text(SubRipItem.text);

            frag.appendChild(item[0]);
        });

        return [frag];
    },
    setItemBySeconds: function (seconds) {
        var SubRipObject = this.srt.search(seconds);

        if (SubRipObject) {
            var index = SubRipObject.id - 1;

            this.setItemByIndex(index);
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
