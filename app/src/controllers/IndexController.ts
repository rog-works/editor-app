import Controller from '../components/Controller';
import Route from '../components/Route';

export default class IndexController extends Controller {
	public index(): void {
		this._res.sendFile('/opt/app/app/app/views/index.html');
	}

	public show(id: number): void {
		this._res.sendFile(`/opt/app/app/app/views/index${id}.html`);
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
