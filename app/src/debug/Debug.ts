import Debugger from './V8Debugger';

type RequestTypes = 'continue' | 'frame';
namespace RequestTypes {
	export const Continue = 'continue';
	export const Frame = 'frame';
}

type StepActions = 'next' | 'in' | 'out';
namespace StepActions {
	export const Next = 'next';
	export const In = 'in';
	export const Out = 'out';
}

type BreakTypes = 'all' | 'uncaught';
namespace BreakTypes {
	export const All = 'all';
	export const Uncaught = 'uncaught';
}

export default class Debug {
	public constructor(
		private client: Debugger = new Debugger(),
		private breakpoints: BreakPoints = new Breakpoints()
	) {
		this._bind();
	}

	private _bind() {
		[
			// - event
			'break',
			'exception'
		].forEach((key) => {
			const camelKey = `${key[0].toUpperCase()}${key.substr(1)}`;
			const handleKey = `on${camelKey}`;
			if (handleKey in this) {
				this.client.on(key, (<any>this[handleKey]).bind(this));
			}
		});
	}

	// socket event

	public connect() {
		this.client.connect();
	}

	public close() {
		this.client.close();
	}

	// v8 protocols
	// - activation

	// deprecated
	// disconnect () {
	// 	return this.client.send('disconnect');
	// }

	public async continue() {
		return this.client.send(RequestTypes.Continue);
	}

	public async in() {
		return this.client.send(RequestTypes.Continue, { stepaction: StepActions.In });
	}

	public async next(count: number = 1) {
		return this.client.send(RequestTypes.Continue, { stepaction: StepActions.Next, stepcount: count });
	}

	public async out() {
		return this.client.send(RequestTypes.Continue, { stepaction: StepActions.Out });
	}

	public async frame(frameId: number = 0) {
		return this.client.send(RequestTypes.Frame, { number: frameId });
	}

	// - source mapping

	public async scripts() {
		return this.client.send(RequestTypes.Scripts);
	}

	public async source() {
		return this.client.send(RequestTypes.Source);
	}

	public async backtrace() {
		return this.client.send(RequestTypes.Backtrace);
	}

	// - break point

	public async setExceptionBreak(type: BreakTypes = BreakTypes.Uncaught, enabled: boolean = false) {
		return this.client.send(RequestTypes.SetExceptionBreak, { type: type, enabled: enabled });
	}

	public async listBreakpoints() {
		const res = await this.client.send(RequestTypes.ListBreakpoints);
		this.breakpoints.clear();
		res.breakpoints.forEach(resBreakPoint => this.breakpoints.add(new Breakpoint(resBreakPoint)));
	}

	public async clearBreakpoint(breakPointId: number) {
		const res = await this.client.send(RequestTypes.Clearbreakpoint, { breakpoint: breakPointId });
		this.breakpoints.removeAt(breakPointId);
	}

	public async changeBreakpoint(breakPointId: number, enabled: booleqn = true) {
		const res = await this.client.send(RequestTypes.ChangeBreakpoint, { breakpoint: breakPointId, enabled: enabled });
		const breakpoint = this.breakpoints.at(res.breakpoint);
		if (breakpoint !== null) { // XXX nullable
			breakpoint.active = enabled;
		}
	}

	public async setBreakpoint(path: string, line: number) {
		const res = await this.client.send(RequestTypes.SetBreakpoint, { target: path, line: line, type: 'script', enabled: true }); // XXX type?
		this.breakpoints.add(new Breakpoint(res));
	}

	// ex
	public async clearAllBreakpoints() {
		for (const breakpoint of this.breakpoints.list) {
			await this.clearBreakpoint(breakpoint.id);
		}
	}

	// - variable

	public async evalute() {
		return this.client.send(RequestTypes.Evalute);
	}

	public async scope() {
		return this.client.send(RequestTypes.Scope);
	}

	public async scopes() {
		return this.client.send(RequestTypes.Scopes);
	}

	public async lookup(): Promise<void> {
		this.client.send(RequestTypes.Lookup);
	}

	public setVariableValue() {
		this.client.send(RequestTypes.SetVariableValue);
	}

	// - system

	public async version() {
		return this.client.send(RequestTypes.Version);
	}

	public async gc() {
		this.client.send(RequestTypes.Gc);
	}

	public async v8flags() {
		this.client.send(RequestTypes.V8flags);
	}

	// event

	public onBreak(res: any) {
	}

	public onException(res: any) {
	}
}

class Breakpoints {
	public constructor(
		private _list: Breakpoint[] = {}
	) {}

	public get list(): Breakpoint[] {
		return this._list;
	}
	
	public get has(id: number): boolean {
		return (id in this._list);
	}

	public at(id: number): Breakpoint {
		return this.has(id) ? this._list[id] : null; // XXX nullable
	}

	public add(breakpoint: Breakpoint): void {
		this._list[breakpoint.id] = breakpoint;
	}

	public removeAt(id: number): void {
		if (this.has(id)) {
			delete this._list[id];
		}
	}

	public clear(): void {
		this._list = {};
	}
}

class Breakpoint {
	public constructor(entity: BreakpointEntity) {
		const id = entity.number || entity.breakpoint;
		const location = entity.actual_locations.pop();
		const active = entity.active !== undefined ? entity.active : true;
		this.id = id;
		this.scriptId = location.script_id;
		this.path = entity.script_name;
		this.line = location.line;
		this.column = location.column;
		this.active = active;
	}
}

// request types
// [
// 	// socket event
// 	'connect',//todo
// 	'close',//todo
// 	// v8 protocols
// 	// - activation
// 	'continue',//todo
// 	'disonnect',//todo
// 	'frame',
// 	// 'suspend',//xxx
// 	// 'restartframe',//xxx
// 	// - source mapping
// 	'scripts',
// 	'source',
// 	'backtrace',
// 	// 'changelive',//xxx
// 	// - break point
// 	'setexceptionbreak',
// 	'listbreakpoints',
// 	'clearbreakpoint',//todo
// 	'changebreakpoint',
// 	'setbreakpoint',//todo
// 	// - variable
// 	'evalute',
// 	'scope',
// 	'scopes',
// 	'lookup',
// 	'setvariablevalue',
// 	// - system
// 	'version',
// 	'gc',
// 	'v8flags'
// ];
