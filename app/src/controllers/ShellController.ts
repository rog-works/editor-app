import Entity from '../entities/Shell';
import Controller from '../components/Controller';
import Route from '../components/Route';

export default class ShellController extends Controller {
	public run(query: string, dir: string = '') {
		const args = query.split(' ');
		const command = args.shift() || '';
		const options = {cwd: `/opt/app${dir}`};
		(new Entity()).run(command, args, options);
		this.view(true);
	}

	// @override
	public static routes(): Route[] {
		return [
			Route.post('/')
				.body('query')
				.query('dir')
				.on('run')
		];
	}
}
