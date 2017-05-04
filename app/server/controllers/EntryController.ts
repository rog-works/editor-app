import Entity from '../entities/Entry';
import Controller from '../components/Controller';
import Route from '../components/Route';

export default class EntryController extends Controller {
	private static readonly PATH_REGULAR = '[\\w\\-.%]+';

	public async index(dir: string = ''): Promise<void> {
		this.view(await Entity.entries(dir));
	}

	public async show(path: string): Promise<void> {
		this.view(await Entity.at(path));
	}

	public async create(path: string): Promise<void> {
		this.view(await Entity.create(path));
	}

	public async update(path: string, content: string): Promise<void> {
		this.view(await Entity.update(path, content));
	}

	public async destroy(path: string): Promise<void> {
		this.view(Entity.destroy(path));
	}

	public async rename(path: string, to: string): Promise<void> {
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
