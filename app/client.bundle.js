/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ({

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = __webpack_require__(4);
var WSEvents;
(function (WSEvents) {
    WSEvents.Message = 'message';
    WSEvents.Open = 'open';
    WSEvents.Close = 'close';
})(WSEvents = exports.WSEvents || (exports.WSEvents = {}));
class WS extends EventEmitter_1.default {
    constructor(url) {
        super(WSEvents.Message, WSEvents.Open, WSEvents.Close);
        this.url = url;
        this._ws = this.connect(this.url);
    }
    connect(url) {
        try {
            const ws = new WebSocket(url);
            ws.onmessage = this._onMessage.bind(this);
            ws.onopen = this._onOpen.bind(this);
            ws.onclose = this._onClose.bind(this);
            return ws;
        }
        catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }
    send(data) {
        this._ws.send(JSON.stringify(data));
    }
    _retry() {
        try {
            this._ws = this.connect(this.url);
        }
        catch (err) {
            setTimeout(this._retry.bind(this), 1000);
        }
    }
    _onMessage(message) {
        this.emit(WSEvents.Message, this, message);
        return true;
    }
    _onOpen() {
        this.emit(WSEvents.Open, this);
        return true;
    }
    _onClose() {
        this.emit(WSEvents.Close, this);
        this._retry();
        return true;
    }
}
exports.default = WS;


/***/ }),

/***/ 22:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const WS_1 = __webpack_require__(10);
const Page_1 = __webpack_require__(9);
console.log(new WS_1.default('ws://localhost:8080'), new Page_1.default(null));


/***/ }),

/***/ 23:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = __webpack_require__(4);
class Node extends EventEmitter_1.default {
    constructor(_parent) {
        super();
        this._parent = _parent;
    }
    addNode(node) {
        node._parent = this;
    }
    addNodes(nodes) {
        for (const node of nodes) {
            node._parent = this;
        }
    }
    fire(tag, ...args) {
        if (this._parent !== null) {
            this._parent._bubble(tag, ...args);
        }
    }
    _bubble(tag, ...args) {
        if (this.emit(tag, this, args)) {
            return;
        }
        if (this._parent !== null) {
            this._parent._bubble(tag, ...args);
        }
    }
}
exports.default = Node;


/***/ }),

/***/ 26:
/***/ (function(module, exports) {

module.exports = require("knockout-es5");

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor(...tags) {
        this._handlers = {};
        for (const tag of tags) {
            this._handlers[tag] = [];
        }
    }
    on(tag, callback) {
        if (this._handlers[tag].indexOf(callback) === -1) {
            this._handlers[tag].unshift(callback);
        }
        return this;
    }
    off(tag, callback) {
        const index = this._handlers[tag].indexOf(callback);
        if (index !== -1) {
            this._handlers[tag].splice(index, 1);
        }
        return this;
    }
    emit(tag, sender, event = undefined) {
        for (const handler of this._handlers[tag]) {
            if (!handler(sender, event)) {
                break;
            }
        }
    }
}
exports.default = EventEmitter;


/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(26);
const Node_1 = __webpack_require__(23);
var States;
(function (States) {
    States.Loading = 'loading';
})(States = exports.States || (exports.States = {}));
class Page extends Node_1.default {
    constructor(_parent = null, // XXX implicit accesser ?!
        display = {
            active: false
        }, icon = {
            'fa-refresh': false,
            'fa-spin': false
        }) {
        super(_parent);
        this.display = display;
        this.icon = icon;
        ko.track(this.display);
        ko.track(this.icon);
    }
    activate(focused) {
        this.display.active(focused);
    }
    _transition(state) {
        for (const key in this.icon) {
            this.icon[key](false);
        }
        if (state === States.Loading) {
            this.icon['fa-refresh'](true);
            this.icon['fa-spin'](true);
        }
    }
}
exports.default = Page;


/***/ })

/******/ });
//# sourceMappingURL=client.bundle.js.map