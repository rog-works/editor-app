import * as $ from 'jquery';

export default class Http {
	public static send<T>(url: string, data: JQueryAjaxSettings = {}): Promise<T> {
		return new Promise((resolve, reject) => {
			const base: JQueryAjaxSettings = {
				url: url,
				type: 'GET',
				dataType: 'json',
				timeout: 1000,
				success: (res: T) => {
					console.log('Respond', params.type, params.url);
					resolve(res);
				},
				error: (res: any, err: string) => {
					console.error('Failed request', params.type, params.url, err, res.status, res.statusText, res.responseText);
					reject(err);
				}
			};
			const params = $.extend(base, data);
			console.log('Request', params.type, params.url);
			$.ajax(params);
		});
	}

	public static get<T>(url: string, data: JQueryAjaxSettings = {}): Promise<T> {
		return this.send(url, $.extend(data, { type: 'GET' }));
	}

	public static post<T>(url: string, data: JQueryAjaxSettings = {}): Promise<T> {
		return this.send(url, $.extend(data, { type: 'POST' }));
	}

	public static put<T>(url: string, data: JQueryAjaxSettings = {}): Promise<T> {
		return this.send(url, $.extend(data, { type: 'PUT' }));
	}

	public static delete<T>(url: string, data: JQueryAjaxSettings = {}): Promise<T> {
		return this.send(url, $.extend(data, { type: 'DELETE' }));
	}
}
