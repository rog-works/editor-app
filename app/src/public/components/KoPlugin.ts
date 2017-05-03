import * as ko from 'knockout-es5';
import Application from '../applications/Application';

type Plugins = 'bindWindowEvent' | 'bindWSEvent';
namespace Plugins {
	export const WindowEvent = 'bindWindowEvent';
	export const WSEvent = 'bindWSEvent';
}

export default class KoPlugin {
	public static bind(bindKeys: Plugins[] = [Plugins.WindowEvent, Plugins.WSEvent]): void {
		for (const key of bindKeys) {
			this[key]();
		}
	}

	public static bindWindowEvent(): void {
		ko.bindingHandlers.windowEvent = {
			init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
				const value = valueAccessor();
				ko.utils.objectForEach(value, (key) => {
					if (!window.hasOwnProperty(`on${key}`)) {
						console.warn('Window event not found', key);
						return;
					}
					const handler = (e: any) => value[key].apply(viewModel, [e]);
					const disposer = () => window.removeEventListener(key, handler); // FIXME
					window.addEventListener(key, handler); // FIXME
					ko.utils.domNodeDisposal.addDisposeCallback(element, disposer);
				});
			}
		};
	}

	public static bindWSEvent(): void {
		let binds: any[] = [];
		ko.bindingHandlers.wsEvent = {
			init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
				const value = valueAccessor();
				ko.utils.objectForEach(value, (key) => {
					const exists = binds.filter((self) => {
						return self === viewModel;
					}).length > 0;
					if (exists) {
						// console.log('Already bind exists');
						return;
					}
					const handler = (sender: any, e: MessageEvent) => value[key].apply(viewModel, [sender, e.data]);
					// XXX
					// const disposer = () => {
					// 	binds = binds.filter(self => self !== viewModel);
					// };
					binds.push(viewModel);
					Application.instance.ws.on(key, handler);
					// XXX
					// ko.utils.domNodeDisposal.addDisposeCallback(element, disposer);
				});
			}
		};
	}
}
