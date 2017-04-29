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
/******/ 	return __webpack_require__(__webpack_require__.s = 27);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("knockout-es5");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
const Node_1 = __webpack_require__(28);
var States;
(function (States) {
    States[States["Loading"] = 0] = "Loading";
    States[States["Syncronized"] = 1] = "Syncronized";
    States[States["Modified"] = 2] = "Modified";
})(States = exports.States || (exports.States = {}));
var Icons;
(function (Icons) {
    Icons.Loading = 'fa-refresh';
    Icons.LoadingSpin = 'fa-spin';
    Icons.Syncronized = 'fa-check-circle';
    Icons.Modified = 'fa-check-circle';
})(Icons || (Icons = {}));
class Page extends Node_1.default {
    constructor(_parent = null, // XXX implicit accesser ?!
        display = {
            active: false
        }, icon = {
            [Icons.Loading]: false,
            [Icons.LoadingSpin]: false,
            [Icons.Syncronized]: false,
            [Icons.Modified]: false
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
            this.icon[key] = false;
        }
        switch (state) {
            case States.Loading:
                this.icon[Icons.Loading] = true;
                this.icon[Icons.LoadingSpin] = true;
                break;
            case States.Modified:
                this.icon[Icons.Modified] = true;
                break;
            case States.Syncronized:
                this.icon[Icons.Syncronized] = true;
        }
    }
}
exports.default = Page;


/***/ }),
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const LogLine_1 = __webpack_require__(30);
class Logger {
    constructor(_owner) {
        this._owner = _owner;
    }
    put(message) {
        this._push(message, false);
    }
    line(message) {
        this._push(message, true);
    }
    _push(message, separated) {
        // console.log(log, separated);
        this._owner.logs.push(new LogLine_1.default(message, this._owner.colorized(message) || 'fc1', separated));
    }
}
exports.default = Logger;


/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
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
                return true;
            }
        }
        return false;
    }
}
exports.default = EventEmitter;


/***/ }),
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
const Page_1 = __webpack_require__(1);
const Logger_1 = __webpack_require__(4);
class Console extends Page_1.default {
    constructor() {
        super();
        this._logger = new Logger_1.default(this);
        this.logs = [];
        this._logger = new Logger_1.default(this);
        this._bind();
        ko.track(this);
    }
    clear() {
        this.logs = [];
    }
    _bind() {
        const _log = console.log;
        const _warn = console.warn;
        const _error = console.error;
        const self = this;
        console.log = (...args) => {
            _log.apply(console, args);
            self._log('LOG', ...args);
        };
        console.warn = (...args) => {
            _warn.apply(console, args);
            self._log('WRN', ...args);
        };
        console.error = (...args) => {
            _error.apply(console, args);
            self._log('ERR', ...args);
        };
    }
    _log(tag, ...args) {
        args.unshift(tag);
        this._logger.line(args.map((arg) => {
            if (Array.isArray(arg) || typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            else {
                return arg;
            }
        }).join(' '));
    }
    colorized(message) {
        if (/^ERR/.test(message)) {
            return 'bc1-e';
        }
        else if (/^WRN/.test(message)) {
            return 'bc1-w';
        }
        else {
            return 'fc1';
        }
    }
}
exports.default = Console;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
const Page_1 = __webpack_require__(1);
const Logger_1 = __webpack_require__(4);
const KeyMap_1 = __webpack_require__(32);
const Http_1 = __webpack_require__(31);
const Path_1 = __webpack_require__(29);
class Shell extends Page_1.default {
    constructor(dir = '/', query = '', css = '', history = [], logs = []) {
        super();
        this.dir = dir;
        this.query = query;
        this.css = css;
        this.history = history;
        this.logs = logs;
        this._logger = new Logger_1.default(this);
        ko.track(this);
    }
    clear() {
        this.logs = [];
    }
    keyup(self, e) {
        switch (e.keyCode) {
            case KeyMap_1.KeyCodes.Enter:
                this._exec();
                return false;
            case KeyMap_1.KeyCodes.LUpper:
                if (e.ctrlKey && e.shiftKey) {
                    this.clear();
                    return false;
                }
                return true;
            default:
                return true;
        }
    }
    _parse(query) {
        let dir = this.dir;
        const matches = query.match(/^cd\s+([\d\w\-\/_.~]+);?(.*)$/);
        if (matches) {
            if (matches.length > 1) {
                if (matches[1].indexOf('~') === 0) {
                    dir = Path_1.default.join('/', matches[1].substr(1));
                }
                else {
                    dir = Path_1.default.join(dir, matches[1]);
                }
            }
            if (matches.length > 2) {
                query = matches[2].trim();
            }
        }
        return [dir, query];
    }
    _exec() {
        return __awaiter(this, void 0, void 0, function* () {
            const orgQuery = this.query;
            const [dir, query] = this._parse(orgQuery);
            if (query.length === 0) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.query = '';
                    this._logger.line(`$ ${orgQuery}`);
                }
                return;
            }
            this.dir = dir;
            this.query = '';
            this._logger.line(`$ ${orgQuery}`);
            const url = '?dir=' + encodeURIComponent(this.dir);
            yield Http_1.default.post(`/shell${url}`, { data: { query: query } });
            if (this.history.indexOf(orgQuery) === -1) {
                this.history.push(orgQuery);
            }
        });
    }
    message([tag, data]) {
        if (tag === 'editor.shell-log') {
            return this._logger.put(data.message);
        }
        return true;
    }
    colorized(line) {
        if (/^\tmodified:/.test(line) ||
            /^\tnew file:/.test(line) ||
            /^\+/.test(line)) {
            return 'fc1-p';
        }
        else if (/^\tdeleted:/.test(line) ||
            /^\-/.test(line)) {
            return 'fc1-e';
        }
        else {
            return 'fc1';
        }
    }
}
exports.default = Shell;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
const Page_1 = __webpack_require__(1);
const Logger_1 = __webpack_require__(4);
class Weblog extends Page_1.default {
    constructor() {
        super();
        this.logs = [];
        this._logger = new Logger_1.default(this);
        ko.track(this);
    }
    clear() {
        this.logs = [];
    }
    message(event) {
        const [tag, data] = event;
        // if (tag === 'editor.access-log') {
        if (tag === 'editor.webpack-log') {
            this._log(data);
        }
        return true;
    }
    _log(data) {
        this._logger.line(this._parseLine(data));
    }
    _parseLine(data) {
        let lines = [];
        for (const key in data) {
            lines.push(data[key]);
        }
        return this.colorized(lines.join(' '));
    }
    colorized(message) {
        message = message.replace(/\s?\/nodered-webpack\s?/, '');
        message = message.replace(/\s?\/editor-webpack\s?/, '');
        message = message.replace(/\s?stdout\s?/, '');
        message = message.replace(/[\w\d]{64}/, '');
        message = message.split('[31m').join('<span style="color:#f00">');
        message = message.split('[32m').join('<span style="color:#0f0">');
        message = message.split('[33m').join('<span style="color:#ff0">');
        message = message.split('[1m').join('<span style="font-weight:bold">');
        message = message.split('[22m').join('</span>');
        message = message.split('[39m').join('</span>');
        return message;
    }
}
exports.default = Weblog;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = __webpack_require__(7);
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
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const WS_1 = __webpack_require__(15);
const Page_1 = __webpack_require__(1);
const Console_1 = __webpack_require__(12);
const Shell_1 = __webpack_require__(13);
const Weblog_1 = __webpack_require__(14);
const Dialog_1 = __webpack_require__(37);
const Editor_1 = __webpack_require__(38);
console.log(new WS_1.default('ws://localhost:8080'), new Page_1.default(null));
console.log(new Console_1.default, new Shell_1.default, new Weblog_1.default);
console.log(new Dialog_1.default, new Editor_1.default);


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = __webpack_require__(7);
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
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Path {
    static join(...args) {
        const routes = [];
        for (const route of args) {
            routes.push(...route.split('/'));
        }
        const results = [];
        for (const route of routes) {
            if (route === '..') {
                results.pop();
            }
            else {
                results.push(route);
            }
        }
        return results.join('/').replace('//', '/'); // XXX
    }
    static dirname(path) {
        return Path.join(path, '..');
    }
    static basename(path) {
        return path.split('/').pop() || '';
    }
    static extention(path) {
        return path.substr(path.lastIndexOf('.') + 1);
    }
    static valid(path) {
        return !/[\\:*?"<>|]+/.test(path);
    }
}
exports.default = Path;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
class LogLine {
    constructor(message, color, separated, css = {}, closed = false) {
        this.message = message;
        this.color = color;
        this.separated = separated;
        this.css = css;
        this.closed = closed;
        this.css = { [color]: true };
        ko.track(this);
        ko.track(this.css);
    }
    expand() {
        this.closed = !this.closed;
    }
}
exports.default = LogLine;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const $ = __webpack_require__(35);
class Http {
    static send(url, data = {}) {
        return new Promise((resolve, reject) => {
            const base = {
                url: url,
                type: 'GET',
                dataType: 'json',
                timeout: 1000,
                success: (res) => {
                    console.log('Respond', params.type, params.url);
                    resolve(res);
                },
                error: (res, err) => {
                    console.error('Failed request', params.type, params.url, err, res.status, res.statusText, res.responseText);
                    reject(err);
                }
            };
            const params = $.extend(base, data);
            console.log('Request', params.type, params.url);
            $.ajax(params);
        });
    }
    static get(url, data = {}) {
        return this.send(url, $.extend(data, { type: 'GET' }));
    }
    static post(url, data = {}) {
        return this.send(url, $.extend(data, { type: 'POST' }));
    }
    static put(url, data = {}) {
        return this.send(url, $.extend(data, { type: 'PUT' }));
    }
    static delete(url, data = {}) {
        return this.send(url, $.extend(data, { type: 'DELETE' }));
    }
}
exports.default = Http;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["Enter"] = 13] = "Enter";
    KeyCodes[KeyCodes["LUpper"] = 76] = "LUpper";
    KeyCodes[KeyCodes["R"] = 82] = "R";
    KeyCodes[KeyCodes["S"] = 83] = "S";
    KeyCodes[KeyCodes["W"] = 87] = "W";
    KeyCodes[KeyCodes["F9"] = 120] = "F9";
})(KeyCodes = exports.KeyCodes || (exports.KeyCodes = {}));


/***/ }),
/* 33 */,
/* 34 */,
/* 35 */
/***/ (function(module, exports) {

module.exports = require("jquery");

/***/ }),
/* 36 */,
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
const EventEmitter_1 = __webpack_require__(7);
var DialogTypes;
(function (DialogTypes) {
    DialogTypes[DialogTypes["Nortice"] = 0] = "Nortice";
    DialogTypes[DialogTypes["Confirm"] = 1] = "Confirm";
    DialogTypes[DialogTypes["Prompt"] = 2] = "Prompt";
})(DialogTypes || (DialogTypes = {}));
var DialogEvents;
(function (DialogEvents) {
    DialogEvents.Accept = 'accept';
    DialogEvents.Cancel = 'cancel';
})(DialogEvents = exports.DialogEvents || (exports.DialogEvents = {}));
class Dialog extends EventEmitter_1.default {
    constructor(title = '', message = '', input = '', confirmed = true, prompted = false, pos = {
            'margin-top': 32 // XXX
        }, display = {
            close: true
        }) {
        super(DialogEvents.Accept, DialogEvents.Cancel);
        this.title = title;
        this.message = message;
        this.input = input;
        this.confirmed = confirmed;
        this.prompted = prompted;
        this.pos = pos;
        this.display = display;
        ko.track(this);
        ko.track(this.pos);
        ko.track(this.display);
    }
    build() {
        return new DialogBuilder(this);
    }
    show(type, title, message, input) {
        const self = this;
        this.title = title;
        this.message = message;
        this.input = input;
        this.confirmed = type !== DialogTypes.Nortice;
        this.prompted = type === DialogTypes.Prompt;
        this.display.close = false;
    }
    ok() {
        this.display.close = true;
        this.emit(DialogEvents.Accept, this, this.prompted ? this.input : true);
    }
    cancel() {
        this.display.close = true;
        this.emit(DialogEvents.Cancel, this, false);
    }
}
exports.default = Dialog;
class DialogBuilder {
    constructor(_owner, _title = '', _message = '', _input = '') {
        this._owner = _owner;
        this._title = _title;
        this._message = _message;
        this._input = _input;
    }
    message(message) {
        this._message = message;
        return this;
    }
    title(title) {
        this._title = title;
        return this;
    }
    input(input) {
        this._input = input;
        return this;
    }
    confirm() {
        this._owner.show(DialogTypes.Confirm, this._title || 'Confirm', this._message, this._input);
    }
    nortice() {
        this._owner.show(DialogTypes.Nortice, this._title || 'Nortice', this._message, this._input);
    }
    prompt() {
        this._owner.show(DialogTypes.Prompt, this._title || 'Prompt', this._message, this._input);
    }
}


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ko = __webpack_require__(0);
// import * as ace from 'ace'; XXX import nessesory
const Page_1 = __webpack_require__(1);
const Path_1 = __webpack_require__(29);
const KeyMap_1 = __webpack_require__(32);
var EditorEvents;
(function (EditorEvents) {
    EditorEvents.UpdateEntry = 'updateEntry';
})(EditorEvents = exports.EditorEvents || (exports.EditorEvents = {}));
class Editor extends Page_1.default {
    constructor(path = '#', state = Page_1.States.Syncronized) {
        super();
        this.path = path;
        this.state = state;
        this.load();
        this._editor().on('change', this.changed.bind(this));
        ko.track(this);
        ko.track(this.icon);
    }
    load(path = '#', content = '') {
        const ext = Path_1.default.extention(path);
        const config = this._configure(ext);
        const editor = this._editor();
        const session = editor.getSession();
        this._transition(Page_1.States.Loading);
        this.path = path;
        session.setValue(content);
        session.setTabSize(config.tabs);
        session.setUseSoftTabs(config.softTabs);
        session.setMode(this._toMode(config.mode));
        this._transition(Page_1.States.Syncronized);
    }
    // XXX Ace editor auto resizing??
    // resize (width, height) {
    // 	this._editor().resize();
    // }
    focus() {
        this._editor().focus();
    }
    keydown(self, e) {
        if (e.ctrlKey || e.metaKey) {
            // handling ctrl + s
            if (e.keyCode === KeyMap_1.KeyCodes.S) {
                this.save();
                return false;
                // FIXME
            }
            else if ([KeyMap_1.KeyCodes.R, KeyMap_1.KeyCodes.W].indexOf(e.keyCode) !== -1) {
                return false;
            }
        }
        return true;
    }
    save() {
        this._transition(Page_1.States.Loading);
        this.fire(EditorEvents.UpdateEntry, this.path, this._content());
    }
    saved(updated) {
        this._transition(updated ? Page_1.States.Syncronized : Page_1.States.Modified);
    }
    changed() {
        if (this.state === Page_1.States.Syncronized) {
            this._transition(Page_1.States.Modified);
        }
    }
    cursor(key) {
        switch (key) {
            case 'left':
                this._editor().navigateLeft(1);
                break;
            case 'right':
                this._editor().navigateRight(1);
                break;
        }
    }
    beforeLoad() {
        this._transition(Page_1.States.Loading);
    }
    // @override
    _transition(state) {
        super._transition(state);
        this.state = state;
    }
    _content() {
        return this._editor().getSession().getValue();
    }
    _configure(extention) {
        const config = {
            sh: { mode: 'sh', tabs: 4, softTabs: false },
            py: { mode: 'python', tabs: 4, softTabs: false },
            php: { mode: 'php', tabs: 4, softTabs: false },
            css: { mode: 'css', tabs: 4, softTabs: false },
            html: { mode: 'html', tabs: 4, softTabs: false },
            json: { mode: 'json', tabs: 4, softTabs: false },
            js: { mode: 'javascript', tabs: 4, softTabs: false },
            ts: { mode: 'typescript', tabs: 4, softTabs: false },
            rb: { mode: 'ruby', tabs: 2, softTabs: true },
            yml: { mode: 'yaml', tabs: 2, softTabs: true },
            yaml: { mode: 'yaml', tabs: 2, softTabs: true }
        };
        return (extention in config) ? config[extention] : config.sh;
    }
    _editor() {
        return ace.edit('editor');
    }
    _toMode(mode) {
        return `ace/mode/${mode}`;
    }
}
exports.default = Editor;


/***/ })
/******/ ]);
//# sourceMappingURL=client.bundle.js.map