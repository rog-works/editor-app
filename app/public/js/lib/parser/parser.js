'use strict';

class Parser {
	constructor (stream, engine = null) {
		this._stream = stream;
		this._engine = engine || (new ParserEngine());
	}

	execute () {
		return this._engine.run(this._stream, this._definitions());
	}

	_definitions () {
		throw new Error('Not implemented');
	}
}

class TokenParser extends Parser {
	constructor (stream) {
		super(stream);
	}

	// @override
	_definitions () {
		return [
			AsToken.is,
			AsTokenWhiteSpace.is
		];
	}
}

class ExpressionParser extends Parser {
	constructor (stream) {
		super(stream);
	}

	// @override
	_definitions () {
		return [
			AsExpression.is
		];
	}
}

class ParserEngine {
	constructor (logging = false) {
		this._logging = logging;
	}

	_debug (...args) {
		if (this._logging) {
			console.log(...args);
		}
	}

	run (stream, definitions) {
		this._debug('PARSE', 'source:', stream.source);
		const data = [];
		while (stream.available) {
			const beginAvailable = stream.available;
			const parseData = [];
			for (const definition of definitions) {
				const begin = stream.pos;
				const result = this._parseDefinition(definition, stream);
				if (result.matched) {
					if (definition.from.included) {
						parseData.push(...result.data);
						this._debug('ADD', 'data:', parseData);
					}
					break;
				} else {
					stream.seek(begin, 'begin');
				}
			}
			if (stream.available === beginAvailable) {
				throw new Error('Unmatch deinitions');
			}
			if (parseData.length > 0) {
				data.push(...parseData);
			}
		}
		return data;
	}

	_parseDefinition (root, stream) {
		let result = this._result([]);
		const begin = stream.pos;
		for (const statement of root) {
			this._debug('DEF', 'path:', statement.path, 'root:', (root.from !== null ? root.from.name : 'null'), 'depends:', (statement.dependecy !== null ? statement.dependecy.name : 'null'), 'avail:', stream.available);
			// XXX ignore statement type
			if (result.then) {
				if (statement.type === 'else') {
					continue;
				}
			}

			// run the statement
			let inResult = null;
			if (typeof statement.dependecy === 'function') {
				// XXX
				inResult = this._parseDefinition(statement.dependecy.is, stream);
			} else if (statement.type in this) {
				inResult = this[statement.type](statement, stream);
			} else {
				throw new Error(`Unexpected statement. ${statement}`);
			}

			// unmatch to exit
			if (!inResult.matched) {
				stream.seek(begin, 'begin');
				this._debug('ROL', 'path:', statement.path, 'root:', (root.from !== null ? root.from.name : 'null'), 'depends:', (statement.dependecy !== null ? statement.dependecy.name : 'null'), 'avail:', stream.available);
				return this._result();
			}

			// merge result
			result.data.push(...inResult.data);
			result.then = inResult.then;
		}
		// XXX
		if (root.from !== null) {
			return this._result(root.from.toData(result.data));
		} else {
			return this._result(result.data);
		}
	}

	if (statement, stream) {
		const {matched, data} = this._parseDefinition(statement, stream);
		if (statement.hasNext) {
			return this._result(matched ? data : [], matched);
		}
		return this._result(data);
	}

	else (statement, stream) {
		return this.if(statement, stream);
	}

	option (statement, stream) {
		const {data} = this.if(statement, stream);
		return this._result(data || []);
	}

	while (statement, stream) {
		let data = [];
		while (true) {
			const beginAvailable = stream.available;
			const result = this._parseDefinition(statement, stream);
			if (result.matched) {
				data.push(...result.data);
			} else {
				break;
			}
		}
		return this._result(data);
	}

	without (statement, stream) {
		const {matched} = this._parseDefinition(statement, stream);
		return this._result(matched ? [] : null);
	}

	on (statement, stream) {
		const data = statement.dependecy.parse(stream);
		return this._result(data);
	}

	_result (data = null, then = false) {
		return {
			matched: data !== null,
			data: (data === null || Array.isArray(data)) ? data : [data],
			then: then
		};
	}
}
