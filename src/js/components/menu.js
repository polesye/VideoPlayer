'use strict';
define([
    'jquery', 'utils', 'components/component'
], function ($, Utils, Component) {
    var Menu = Component.extend({
        className: 's2js-menu',
        _constructor: function () { }
    });

    return Menu;
});
