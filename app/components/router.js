'use strict';

class Router {
	static get (path) {
		return (new RouteBuilder('get')).path(path);
	}

	static post (path) {
		return (new RouteBuilder('post')).path(path);
	}

	static put (path) {
		return (new RouteBuilder('put')).path(path);
	}

	static delete (path) {
		return (new RouteBuilder('delete')).path(path);
	}

	static bind (controller) {
		const expressRouter = require('express').Router();
		for (const route of controller.routes()) {
			expressRouter[route.method](route.path, (req, res) => {
				Router._dispatch(controller, route, req, res);
			});
		}
		return expressRouter;
	}

	static _dispatch (controller, route, req, res) {
		controller.req = req;
		controller.res = res;
		const args = Router._parseArgs(route.args, req);
		console.log('Dispached.', route.on, args);
		controller[route.on](...args);
	}

	static _parseArgs (argKeys, req) {
		let args = [];
		let curr = null;
		for (const keys of argKeys) {
			curr = req;
			for (const key of keys.split('.')) {
				if (key in curr) {
					curr = curr[key];
				} else {
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

class RouteBuilder {
	constructor (method) {
		this._method = method;
		this._path = '/';
		this._on = 'index';
		this._args = [];
	}

	path (path) {
		this._path = path;
		return this;
	}

	params (key) {
		this._args.push(`params.${key}`);
		return this;
	}

	query (key) {
		this._args.push(`query.${key}`);
		return this;
	}

	body (key) {
		this._args.push(`body.${key}`);
		return this;
	}

	on (listen) {
		this._on = listen;
		return this._build();
	}

	_build () {
		return {
			method: this._method,
			path: this._path,
			on: this._on,
			args: this._args
		};
	}
}

module.exports = Router;
