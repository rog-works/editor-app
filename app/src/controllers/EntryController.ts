import Entity from '../entities/Entry';
import Controller from '../components/Controller';
import Route from '../components/Route';

export default class EntryController extends Controller {
	private static readonly PATH_REGULAR = '[\\w\\-.%]+';

	public index(dir: string = ''): void {
		this.view(Entity.entries(dir));
	}

	public show(path: string): void {
		this.view(Entity.at(path));
	}

	public create(path: string): void {
		this.view(Entity.create(path));
	}

	public update(path: string, content: string): void {
		this.view(Entity.update(path, content));
	}

	public destroy(path: string): void {
		this.view(Entity.destroy(path));
	}

	public rename(path: string, to: string): void {
		this.view(Entity.rename(path, to));
	}

	// @override
	public keys(): string[] {
		return Entity.keys();
	}

	// @override
	public static routes(): Route[] {
		return [
			Route.get('/')
				.query('dir')
				.on('index'),
			Route.get(`/:path(${EntryController.PATH_REGULAR})`)
				.params('path')
				.on('show'),
			Route.post('/')
				.body('path')
				.on('create'),
			Route.put(`/:path(${EntryController.PATH_REGULAR})`)
				.params('path')
				.body('content')
				.on('update'),
			Route.delete(`/:path(${EntryController.PATH_REGULAR})`)
				.params('path')
				.on('destroy'),
			Route.put(`/:path(${EntryController.PATH_REGULAR})/rename`)
				.params('path')
				.query('to')
				.on('rename')
		];
	}
}
