'use strict';
define([
    'jquery', 'utils'
], function ($, Utils) {
    var Component = function () {};

    Component.extend = function (protoProps, staticProps) {
        var Parent = this,
            Child = function () { return Parent.apply(this, arguments); };

        if ($.isFunction(protoProps._constructor)) {
            Child = function () {
                protoProps._constructor.apply(this, arguments);
                if ($.isFunction(this.initialize)) {
                    this.initialize.apply(this, arguments);
                }
            };
        }

        $.extend(Child, Parent, staticProps);

        // inherit
        var F = function () {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.constructor = Parent;
        Child.__super__ = Parent.prototype;

        if (protoProps) {
            $.extend(Child.prototype, protoProps);
        }

        return Child;
    };

    return Component;
});
