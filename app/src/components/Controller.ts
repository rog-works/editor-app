import {Request, Response} from 'express';
import Render from '../helpers/Render';
import Projector from '../helpers/Projector';
import Route from './Route';

export interface ControllerConstructor extends ObjectConstructor {
	new (_req: Request, _res: Response): Controller
}

export default class Controller {
	public constructor(
		protected _req: Request,
		protected _res: Response
	) {}

	public static routes(): Route[] {
		throw new Error('Not implemented'); // XXX expected override...
	}

	public keys(): string[] {
		throw new Error('Not implemented'); // XXX expected override...
	}

	public view(body: any, filter: string = ''): void {
		const keys = filter || this.keys().join('|');
		const accept = keys.split('|');
		Render.json(this._res, Projector.select(body, accept));
	}

	public error(message: string = '', status: number = 500): void {
		this._res.sendStatus(status);
		this._res.send(message);
	}
}
