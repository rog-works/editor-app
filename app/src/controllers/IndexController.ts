import Controller from '../components/Controller';
import Route from '../components/Route';

export default class IndexController extends Controller {
	public index(): void {
		this._res.sendFile('/opt/app/app/app/views/index.html');
	}

	public show(): void {
		this._res.sendFile(`/opt/app/app/app/views/index2.html`);
	}

	// @override
	public static routes(): Route[] {
		return [
			Route.get('/').on('index'),
			Route.get('/2').on('show')
		];
	}
}
