import Controller from '../components/Controller';
import Route from '../components/Route';
import * as Path from 'path';

export default class IndexController extends Controller {
	public index(): void {
		this._res.sendFile(Path.join(__dirname, '../views/index.html'));
	}

	public show(id: number): void {
		this._res.sendFile(Path.join(__dirname, `../views/index${id}.html`));
	}

	// @override
	public keys(): string[] {
		return [];
	}

	// @override
	public static routes(): Route[] {
		return [
			Route.get('/').on('index'),
			Route.get('/:id([\\d]+)')
				.params('id')
				.on('show')
		];
	}
}
