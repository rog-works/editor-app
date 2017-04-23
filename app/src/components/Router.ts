import * as Express from 'express';
import {default as Controller, ControllerConstructor} from './Controller';
import Route from './Route';

export default class Router {
	public static bind(constructor: ControllerConstructor, routes: Route[]): Express.RequestHandler {
		for (const route of routes) {
			if ((<any>Express.Router).hasOwnProperty(route.method)) {
				(<any>Express.Router)[route.method](route.path, (req: Express.Request, res: Express.Response) => {
					this._dispatch(new constructor(req, res), this._parseArgs(route.args, req), route);
				});
			}
		}
		return Express.Router;
	}

	public static _dispatch(controller: Controller, args: any, route: Route) {
		if ((<any>controller).hasOwnProperty(route.on)) {
			console.log('Dispached.', route.on, args);
			(<any>controller)[route.on](...args);
		} else {
			throw new Error(`Undefined method. ${controller.constructor.name}.${route.on}`);
		}
	}

	public static _parseArgs(argKeys: string[], req: Express.Request): any {
		let args = [];
		let curr = <any>req;
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
