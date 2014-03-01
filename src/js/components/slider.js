s2js.Slider = s2js.Component.extend({
    className: '',
    classNameDefault: 's2js-slider',
    callbacks: {
        start: null,
        slide: null,
        stop: null
    },
    axis: 'x',
    max: 100,
    _position: 0,
    _constructor: function (player, media) {
        this.player = player;
        this.media = media;
        this.element = this.build.apply(this, arguments);
        this._styleName = this.axis === 'y' ? 'top' : 'left';

        this.slider.on({
            'mousedown': this.onMousedownHandler.bind(this),
            'click': false
        });
        this.element.on({
            'click': this.onClickHandler.bind(this),
        });

        $(window).resize(this.getSizes.bind(this));
        this.getSizes();
    },
    build: function (player, media) {
        var container = player.element,
            sliderContainer = $('<div class="s2js-slider-container"></div>'),
            slider = $('<a href="#"></a>'),
            range = $('<div class="s2js-slider-range"></div>'),
            title = s2js.i18n.t('slider');

        slider
            .attr({
                role: 'slider',
                title: title
            })
            .addClass([this.classNameDefault, this.className].join(' '))
            .appendTo(sliderContainer);

        sliderContainer
            .prepend(range)
            .appendTo(container);

        this.slider = slider;
        this.range = range;

        return sliderContainer;
    },
    onMousedownHandler: function (event) {
        var offset = this.slider.offset();

        this.offset = this.axis === 'y' ?
            event.pageY - offset[this._styleName] :
            event.pageX - offset[this._styleName];

        $(document).on({
            'mousemove.video': this.onMousemoveHandler.bind(this),
            'mouseup': this.onMouseupHandler.bind(this)
        });

        if ($.isFunction(this.callbacks.start)) {
            this.callbacks.start.call(this, this.getPosition());
        }

        event.preventDefault();
    },
    onMousemoveHandler: function (event) {
        var k = this.getCoeff(),
            coord = this.axis === 'y' ? event.pageY : event.pageX,
            position = (coord - this.offset - this.sizes.offset) * k; // px -> %

        position = Math.min(position, 100);
        position = Math.max(position, 0);

        this.setPosition(position);

        if ($.isFunction(this.callbacks.slide)) {
            this.callbacks.slide.call(this, position);
        }

        event.preventDefault();
    },
    onMouseupHandler: function (event) {
        $(document).off('mousemove.video');

        if ($.isFunction(this.callbacks.end)) {
            this.callbacks.end.call(this, this.getPosition());
        }

        event.preventDefault();
    },
    onClickHandler: function (event) {
        var k = this.getCoeff(),
            pagePos = this.axis === 'y' ? event.pageY : event.pageX,
            pos = (pagePos - this.sizes.offset) * k; // px -> %

        this.setPosition(pos);

        if ($.isFunction(this.callbacks.slide)) {
            this.callbacks.slide.call(this, pos);
        }

        event.preventDefault();
    },
    getCoeff: function () {
        return 100/this.sizes.size;
    },
    getPosition: function () {
        return this._position;
    },
    setPosition: function (position) {
        var slider = this.slider[0],
            range = this.range[0],
            styleName = this._styleName;

        position = s2js.Utils.round(position, 2);

        setTimeout(function () {
            slider.style[styleName] = position + '%';
            range.style[this.axis === 'y' ? 'height' : 'width'] = position + '%';
        }, 0);
        this._position = position;
    },
    getValue: function () {
        return s2js.Utils.round(this.getPosition() * this.max / 100, 2);
    },
    setValue: function (value) {
        var position = 100 * value / this.max;

        this.setPosition(position);
    },
    getSizes: function () {
        var el = this.element,
            isAxisY = this.axis === 'y';

        this.sizes = {
            size: isAxisY ? el.height() : el.width(),
            offset: isAxisY ? el.offset().top : el.offset().left
        };
    },
    setMaxValue: function (value) {
        this.max = value;
    }
});
