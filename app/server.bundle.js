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
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Render_1 = __webpack_require__(25);
const Projector_1 = __webpack_require__(24);
class Controller {
    constructor(_req, _res) {
        this._req = _req;
        this._res = _res;
    }
    static routes() {
        throw new Error('Not implemented'); // XXX expected override...
    }
    keys() {
        throw new Error('Not implemented'); // XXX expected override...
    }
    view(body, filter = '') {
        const keys = filter || this.keys().join('|');
        const accept = keys.split('|');
        Render_1.default.json(this._res, Projector_1.default.select(body, accept));
    }
    error(message = '', status = 500) {
        this._res.sendStatus(status);
        this._res.send(message);
    }
}
exports.default = Controller;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Verbs;
(function (Verbs) {
    Verbs.Get = 'get';
    Verbs.Post = 'post';
    Verbs.Put = 'put';
    Verbs.Delete = 'delete';
})(Verbs || (Verbs = {}));
class Route {
    constructor(method, path, on = 'index', args = []) {
        this.method = method;
        this.path = path;
        this.on = on;
        this.args = args;
    }
    static get(path) {
        return new RouteBuilder(new this(Verbs.Get, path));
    }
    static post(path) {
        return new RouteBuilder(new this(Verbs.Post, path));
    }
    static put(path) {
        return new RouteBuilder(new this(Verbs.Put, path));
    }
    static delete(path) {
        return new RouteBuilder(new this(Verbs.Delete, path));
    }
}
exports.default = Route;
class RouteBuilder {
    constructor(_route) {
        this._route = _route;
    }
    path(path) {
        this._route.path = path;
        return this;
    }
    params(key) {
        this._route.args.push(`params.${key}`);
        return this;
    }
    query(key) {
        this._route.args.push(`query.${key}`);
        return this;
    }
    body(key) {
        this._route.args.push(`body.${key}`);
        return this;
    }
    on(listen) {
        this._route.on = listen;
        return this._route;
    }
}


/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 6 */
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
const fs = __webpack_require__(5);
const Path = __webpack_require__(10);
const glob = __webpack_require__(34);
const child_process_1 = __webpack_require__(8);
class Storage {
    static _async(func, ...args) {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    console.error('ERROR', error);
                    reject(error);
                }
                else {
                    resolve(result);
                }
            };
            args.push(callback);
            func(...args);
        });
    }
    static entries(directory, nameOnly = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                ignore: [
                    directory,
                    '**/node_modules/**'
                ],
                nosort: true,
                mark: true
            };
            let entries = yield this._async(glob, Path.join(directory, '**'), options);
            entries.sort(this._sort.bind(this));
            if (nameOnly) {
                entries = entries.map(self => Path.basename(self));
            }
            return entries;
        });
    }
    static rootDir() {
        return process.cwd();
    }
    static at(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._async(fs.readFile, path, 'utf8');
        });
    }
    static create(path, content = 'empty') {
        return __awaiter(this, void 0, void 0, function* () {
            this.mkdir(Path.dirname(path));
            yield this._async(fs.writeFile, path, content, 'utf8');
            return true;
        });
    }
    static update(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._async(fs.writeFile, path, content, 'utf8');
            return true;
        });
    }
    static rename(path, to) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._async(fs.rename, path, to);
            return true;
        });
    }
    static remove(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isFile(path)) {
                yield this._async(fs.unlink, path);
            }
            else {
                yield this._async(fs.rmdir, path);
            }
            return true;
        });
    }
    static isFile(path) {
        return !path.endsWith('/');
    }
    static exists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._async(fs.stat, path)) !== null;
        });
    }
    static mkdir(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._async(child_process_1.exec, `mkdir -p ${path}`); // XXX exec...
        });
    }
    static _sort(a, b) {
        if (this.isFile(a)) {
            a = `${Path.dirname(a)}/z_${Path.basename(a)}`;
        }
        if (this.isFile(b)) {
            b = `${Path.dirname(b)}/z_${Path.basename(b)}`;
        }
        return a > b ? 1 : -1;
    }
}
exports.default = Storage;


/***/ }),
/* 7 */,
/* 8 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(5);
const Express = __webpack_require__(9);
const Morgan = __webpack_require__(36);
const BodyParser = __webpack_require__(33);
const Router_1 = __webpack_require__(17);
const IndexController_1 = __webpack_require__(19);
const EntryController_1 = __webpack_require__(18);
const ShellController_1 = __webpack_require__(20);
class Application {
    constructor(_app = Express()) {
        this._app = _app;
    }
    _log() {
        const stream = fs.createWriteStream(Application.ACCESS_LOG_PATH, { flags: 'a' });
        const options = { stream: stream };
        const format = [
            ':remote-addr',
            '-',
            ':remote-user',
            '[:date[iso]]',
            '":method :url HTTP/:http-version"',
            ':status',
            ':res[content-length]',
            ':response-time',
            '":referrer"',
            '":user-agent"'
        ].join(' ');
        Morgan.format('my', format);
        return Morgan('my', options);
    }
    _depended() {
        // this._app.use(require('compression')());
        this._app.use(Express.static(Application.PUBLIC_ROOT_PATH));
        this._app.use(BodyParser.urlencoded({ extended: false }));
        this._app.use(this._log());
    }
    _bind() {
        // FIXME 
        this._app.use('/', Router_1.default.bind(IndexController_1.default));
        this._app.use('/entry', Router_1.default.bind(EntryController_1.default));
        this._app.use('/shell', Router_1.default.bind(ShellController_1.default));
    }
    static listen(port) {
        const self = new Application();
        self._depended();
        self._bind();
        self._app.listen(port, () => {
            console.log('INFO', `Listening on port ${port}`);
        });
    }
}
Application.PUBLIC_ROOT_PATH = '/opt/app/app/app/public';
Application.ACCESS_LOG_PATH = '/var/log/app/editor.log';
exports.default = Application;


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = __webpack_require__(11);
Application_1.default.listen(process.env.PORT);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Express = __webpack_require__(9);
class Router {
    static bind(construct) {
        const router = Express.Router();
        for (const route of construct.routes()) {
            if (route.method in router) {
                router[route.method](route.path, (req, res) => {
                    this._dispatch(new construct(req, res), this._parseArgs(route.args, req), route);
                });
            }
        }
        return router;
    }
    static _dispatch(controller, args, route) {
        if (route.on in controller) {
            console.log('INFO', 'Dispache handler.', route.on, args);
            controller[route.on](...args);
        }
        else {
            throw new Error(`Undefined method. ${controller.constructor.name}.${route.on}`);
        }
    }
    static _parseArgs(argKeys, req) {
        let args = [];
        let curr = req;
        for (const keys of argKeys) {
            curr = req;
            for (const key of keys.split('.')) {
                if (key in curr) {
                    curr = curr[key];
                }
                else {
                    curr = req;
                    break;
                }
            }
            if (curr !== req) {
                args.push(curr);
            }
        }
        return args;
    }
}
exports.default = Router;


/***/ }),
/* 18 */
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
const Entry_1 = __webpack_require__(21);
const Controller_1 = __webpack_require__(2);
const Route_1 = __webpack_require__(3);
class EntryController extends Controller_1.default {
    index(dir = '') {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(yield Entry_1.default.entries(dir));
        });
    }
    show(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(yield Entry_1.default.at(path));
        });
    }
    create(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(yield Entry_1.default.create(path));
        });
    }
    update(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(yield Entry_1.default.update(path, content));
        });
    }
    destroy(path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(Entry_1.default.destroy(path));
        });
    }
    rename(path, to) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view(Entry_1.default.rename(path, to));
        });
    }
    // @override
    keys() {
        return Entry_1.default.keys();
    }
    // @override
    static routes() {
        return [
            Route_1.default.get('/')
                .query('dir')
                .on('index'),
            Route_1.default.get(`/:path(${EntryController.PATH_REGULAR})`)
                .params('path')
                .on('show'),
            Route_1.default.post('/')
                .body('path')
                .on('create'),
            Route_1.default.put(`/:path(${EntryController.PATH_REGULAR})`)
                .params('path')
                .body('content')
                .on('update'),
            Route_1.default.delete(`/:path(${EntryController.PATH_REGULAR})`)
                .params('path')
                .on('destroy'),
            Route_1.default.put(`/:path(${EntryController.PATH_REGULAR})/rename`)
                .params('path')
                .query('to')
                .on('rename')
        ];
    }
}
EntryController.PATH_REGULAR = '[\\w\\-.%]+';
exports.default = EntryController;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Controller_1 = __webpack_require__(2);
const Route_1 = __webpack_require__(3);
class IndexController extends Controller_1.default {
    index() {
        this._res.sendFile('/opt/app/app/app/views/index.html');
    }
    index2() {
        this._res.sendFile('/opt/app/app/app/views/index2.html');
    }
    // @override
    static routes() {
        return [
            Route_1.default.get('/').on('index'),
            Route_1.default.get('/2').on('index2')
        ];
    }
}
exports.default = IndexController;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Shell_1 = __webpack_require__(22);
const Controller_1 = __webpack_require__(2);
const Route_1 = __webpack_require__(3);
class ShellController extends Controller_1.default {
    run(query, dir = '') {
        const args = query.split(' ');
        const command = args.shift() || '';
        const options = { cwd: `/opt/app${dir}` };
        (new Shell_1.default()).run(command, args, options);
        this.view(true);
    }
    // @override
    static routes() {
        return [
            Route_1.default.post('/')
                .body('query')
                .query('dir')
                .on('run')
        ];
    }
}
exports.default = ShellController;


/***/ }),
/* 21 */
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
const Storage_1 = __webpack_require__(6);
const Path = __webpack_require__(10);
class Entry {
    constructor(realPath, isFile, content) {
        const relPath = Entry._toRelativePath(realPath);
        const isText = Entry._isText(Path.basename(relPath));
        this.path = relPath;
        this.isFile = isFile;
        this.isText = isText;
        this.content = content;
        if (isFile && content.length > 0) {
            if (isText) {
                this.content = content.toString();
            }
            else {
                this.content = Entry._toHex(content);
            }
        }
    }
    static keys() {
        return ['path', 'isFile', 'isText', 'content'];
    }
    static entries(relDirPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const realDirPath = this._toRealPath(relDirPath);
            return (yield Storage_1.default.entries(realDirPath, false))
                .map((entity) => {
                const relPath = this._toRelativePath(entity);
                const isFile = this._isFile(entity);
                return new this(entity, isFile, '');
            });
        });
    }
    static at(relPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const realPath = this._toRealPath(relPath);
            const isFile = this._isFile(realPath);
            if (isFile) {
                return new this(realPath, isFile, yield Storage_1.default.at(realPath));
            }
            else {
                return new this(realPath, isFile, '');
            }
        });
    }
    static create(relPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Storage_1.default.create(this._toRealPath(relPath));
        });
    }
    static update(relPath, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const realPath = this._toRealPath(relPath);
            return yield Storage_1.default.update(realPath, content);
        });
    }
    static rename(relPath, relToPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Storage_1.default.rename(this._toRealPath(relPath), this._toRealPath(relToPath));
        });
    }
    static destroy(relPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Storage_1.default.remove(this._toRealPath(relPath));
        });
    }
    static _isFile(realPath) {
        return Storage_1.default.isFile(realPath);
    }
    static _toRealPath(relPath) {
        return `${Storage_1.default.rootDir()}${relPath}`;
    }
    static _toRelativePath(realPath) {
        return realPath.substr(Storage_1.default.rootDir().length); // XXX inaccuracy
    }
    static _toHex(content) {
        return new Buffer(content, 'utf8');
    }
    static _isText(name) {
        // equal file name
        const names = [
            'Vagrantfile',
            'Dockerfile'
        ];
        if (names.indexOf(name) !== -1) {
            return true;
        }
        // with extension
        return [
            // script
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.php',
            '.rb',
            '.py',
            '.sh',
            // document
            '.txt',
            '.html',
            '.md',
            // data
            '.css',
            '.yml',
            '.yaml',
            '.json',
            '.conf',
            '.cnf',
            '.sql',
            '.log'
        ].indexOf(Path.extname(name)) !== -1;
    }
}
exports.default = Entry;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(5);
const Process_1 = __webpack_require__(26);
const Storage_1 = __webpack_require__(6);
class Shell {
    constructor(_stdout = fs.createWriteStream(Shell.LOG_PATH), _options = { cwd: Storage_1.default.rootDir } // XXX any
    ) {
        this._stdout = _stdout;
        this._options = _options; // XXX any
    }
    run(command, args, _options = {}) {
        let self = this;
        let options = _options || this._options;
        (new Process_1.default(command))
            .add(args)
            .option(options)
            .on('stdout', (data) => self._onStdout(data))
            .on('stderr', (data) => self._onStderr(data))
            .run();
    }
    _onStdout(data) {
        this._stdout.write(data);
    }
    _onStderr(data) {
        this._stdout.write(data);
    }
}
Shell.LOG_PATH = '/var/log/app/editor-shell.log'; // XXX fix
exports.default = Shell;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class CSV {
    static stringify(body) {
        return this._parse(body, '\n');
    }
    static _parse(body, delemiter) {
        if (Array.isArray(body)) {
            return body.map((self) => {
                return CSV._parse(self, ',');
            }).join(delemiter);
        }
        else if (typeof body === 'object') {
            let values = [];
            for (let key in body) {
                values.push(CSV._parse(body[key], ','));
            }
            return values.join(',');
        }
        else {
            return body;
        }
    }
}
exports.default = CSV;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Projector {
    static select(body, routes) {
        if (Array.isArray(body)) {
            return body.map(self => this.select(self, routes));
        }
        else if (typeof body === 'object') {
            return this._assoc(this._plack(body, routes));
        }
        else {
            return body;
        }
    }
    static _plack(obj, routes) {
        let flattened = {};
        for (const route of routes) {
            let curr = obj;
            for (const key of route.split('.')) {
                if (key in curr) {
                    curr = curr[key];
                }
                else {
                    curr = obj;
                    break;
                }
            }
            if (curr !== obj) {
                flattened[route] = curr;
            }
        }
        return flattened;
    }
    static _assoc(flattened) {
        let obj = {};
        for (const route in flattened) {
            const value = flattened[route];
            let curr = obj;
            let keys = route.split('.');
            const lastKey = keys.pop();
            for (const key of keys) {
                if (!(key in curr)) {
                    // FIXME
                    curr[key] = /^[\d]/.test(key) ? [] : {};
                }
                curr = curr[key];
            }
            if (lastKey) {
                curr[lastKey] = value;
            }
        }
        return obj;
    }
}
exports.default = Projector;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const CSV_1 = __webpack_require__(23);
class Render {
    static notFound(res, message = 'Resource not found') {
        res.sendStatus(404);
        res.send(message);
    }
    static json(res, body) {
        res.contentType('application/json');
        this._send(res, body, JSON.stringify);
    }
    static csv(res, body) {
        res.contentType('text/csv');
        this._send(res, body, CSV_1.default.stringify);
    }
    static _send(res, body, responder) {
        console.log(body);
        if (body !== null) {
            res.send(responder(body));
        }
        else {
            res.sendStatus(404);
        }
    }
    static hoge() {
        console.log('OK');
    }
}
exports.default = Render;
;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __webpack_require__(8);
class Process {
    constructor(_command, _args = [], _options = {}, _handlers = {}) {
        this._command = _command;
        this._args = _args;
        this._options = _options;
        this._handlers = _handlers;
        this._handlers = {
            // stdin: this.stdin,
            stdout: this._stdout,
            stderr: this._stderr
        };
    }
    add(arg, available = true) {
        if (available) {
            if (Array.isArray(arg)) {
                for (const a of arg) {
                    this._args.push(a);
                }
            }
            else {
                this._args.push(arg);
            }
        }
        return this;
    }
    option(options) {
        this._options = options;
        return this;
    }
    on(tag, handler) {
        this._handlers[tag] = handler;
        return this;
    }
    _stdout(data) {
        console.log('TRACE', data);
    }
    _stderr(data) {
        console.log('TRACE', data);
    }
    run() {
        console.log('TRACE', 'Executed command', this._command, this._args);
        const query = `${this._command} ${this._args.join(' ')}`;
        const child = child_process_1.exec(query, this._options);
        child.stdout.on('data', this._handlers.stdout);
        child.stderr.on('data', this._handlers.stderr);
    }
}
exports.default = Process;


/***/ }),
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = require("glob");

/***/ }),
/* 35 */,
/* 36 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ })
/******/ ]);
//# sourceMappingURL=server.bundle.js.map