/**
 * 传出主对象，支持模块注入
 * @param  {[type]} typeof win.define    [description]
 * @return {[type]}        [description]
 */
	if (typeof win.define === "function" && ( win.define.amd || win.define.cmd )) {
        // AMD
        win.define([], M);
	} else if (typeof win.exports === "object") {
        // Node, CommonJS-like
        module.exports = M;
	} else {
	    win.lib = M;
	}

/* global window: true */
/* global document: true */
})(window, document);