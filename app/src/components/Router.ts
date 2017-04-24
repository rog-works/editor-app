import * as Express from 'express';
import {default as Controller, ControllerConstructor} from './Controller';
import Route from './Route';

export default class Router {
	public static bind(construct: ControllerConstructor): Express.RequestHandler {
		const router = Express.Router();
		for (const route of (<any>construct).routes()) { // XXX any
			if (router.hasOwnProperty(route.method)) {
				(<any>router)[route.method](route.path, (req: Express.Request, res: Express.Response) => {
					this._dispatch(new construct(req, res), this._parseArgs(route.args, req), route);
				});
			}
		}
		return router;
	}

	public static _dispatch(controller: Controller, args: any, route: Route) {
		if (controller.hasOwnProperty(route.on)) {
			console.log('INFO', 'Dispache handler.', route.on, args);
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
