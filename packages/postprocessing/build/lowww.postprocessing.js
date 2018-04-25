(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.lowww = global.lowww || {}, global.lowww.postprocessing = factory());
}(this, (function () { 'use strict';

    var index = {
        version: 'postprocessing',
    };

    return index;

})));
