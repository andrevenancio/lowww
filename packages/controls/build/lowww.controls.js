(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.lowww = global.lowww || {}, global.lowww.controls = factory());
}(this, (function () { 'use strict';

	var index = {
	    version: 'controls',
	};

	return index;

})));
