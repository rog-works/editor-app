'use strict';

const spawn = require('child_process').spawn;

class ProcessProvider {
	/**
	 * Create instance
	 * @param string command Target command
	 */
	constructor (command) {
		this._command = command;
		this._args = [];
		this._options = {};
		this._handlers = {
			// stdin: this.stdin,
			stdout: this._stdout,
			stderr: this._stderr
		};
	}

	/**
	 * Added argument
	 * @param string/array arg Argument
	 * @param bool available Added condition
	 * @return ProcessProvider this
	 */
	add (arg, available = true) {
		if (available) {
			if (Array.isArray(arg)) {
				for (let a of arg) {
					this._args.push(a);
				}
			} else {
				this._args.push(arg);
			}
		}
		return this;
	}

	/**
	 * Setup options
	 * @param object options ChildProcess options
	 * @return ProcessProvider this
	 * @see child_process.spawn
	 */
	option (options) {
		this._options = options;
		return this;
	}

	/**
	 * Setup event handler
	 * @oaram string Event tag. 'stdout' or 'stderr'
	 * @param function handler Handling function
	 * @return ProcessProvider this
	 */
	on (tag, handler) {
		this._handlers[tag] = handler;
		return this;
	}

	/**
	 * The default handler for the stdout event
	 * @param string output stdout
	 */
	_stdout (data) {
		console.log(data);
	}

	/**
	 * The default handler for the stderr event
	 * @param string output stderr
	 */
	_stderr (data) {
		console.log(data);
	}

	/**
	 * Run the query
	 * @return bool Run result
	 */
	run () {
    	console.log('executed', this._command, this._args);
        let child = spawn(this._command, this._args, this._options);
        child.stdout.on('data', this._handlers.stdout);
        child.stderr.on('data', this._handlers.stderr);
		return true;
	}
}

module.exports = ProcessProvider;
