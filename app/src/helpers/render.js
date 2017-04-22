'use strict';

class Render {
	static notFound (res, message = 'Resource not found') {
		res.sendStatus(404);
		res.send(message);
	}

	static json (res, body) {
		res.contentType('application/json');
		Render._send(res, body, JSON.stringify);
	}

	static csv (res, body) {
		const CSV = require('./csv');
		res.contentType('text/csv');
		Render._send(res, body, CSV.stringify);
	}

	static _send (res, body, responder) {
		console.log(body);
		if (body !== null) {
			res.send(responder(body));
		} else {
			res.sendStatus(404);
		}
	}
};

module.exports = Render;