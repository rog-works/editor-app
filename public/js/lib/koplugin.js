'use strict';

class KoPlugin {
	static bind (bindKeys = ['bindWindowEvent', 'bindWSEvent']) {
		for (const key of bindKeys) {
			if (key in KoPlugin) {
				KoPlugin[key]();
			}
		}
	}

	static bindWindowEvent () {
		ko.bindingHandlers.windowEvent = {
			init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
				const value = valueAccessor();
				ko.utils.objectForEach(value, (key) => {
					if (!window.hasOwnProperty(`on${key}`)) {
						console.warn('Window event not found', key);
						return;
					}
					const handler = (e) => {
						return value[key].apply(viewModel, [e]);
					};
					const disposer = () => {
						$(window).off(key, handler);
					};
					$(window).on(key, handler);
					ko.utils.domNodeDisposal.addDisposeCallback(element, disposer);
				});
			}
		};
	}

	static bindWSEvent () {
		let binds = [];
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
					const handler = (e) => {
						return value[key].apply(viewModel, [e]);
					};
					// XXX
					// const disposer = () => {
					// 	binds = binds.filter((self) => {
					// 		return self !== viewModel;
					// 	});
					// };
					binds.push(viewModel);
					APP.ws.on(key, handler);
					// XXX
					// ko.utils.domNodeDisposal.addDisposeCallback(element, disposer);
				});
			}
		};
	}
}
