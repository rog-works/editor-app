import {Response} from 'express';
import CSV from './CSV';

export default class Render {
	public static notFound(res: Response, message: string = 'Resource not found'): void {
		res.sendStatus(404);
		res.send(message);
	}

	public static json(res: Response, body: any): void {
		res.contentType('application/json');
		this._send(res, body, JSON.stringify);
	}

	public static csv(res: Response, body: any): void {
		res.contentType('text/csv');
		this._send(res, body, CSV.stringify);
	}

	public static _send(res: Response, body: any, responder: Function): void {
		console.log(body);
		if (body !== null) { // XXX bad nullable
			res.send(responder(body));
		} else {
			res.sendStatus(404);
		}
	}

	public static hoge() { // FIXME unnecessary method
		console.log('OK');
	}
};
