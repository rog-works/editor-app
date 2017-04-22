import CSV from './helpers/CSV';
import File from './io/File';
import Process from './io/Process';

class Test {
	constructor(
		private _hoge: number = 0,
		private _fuga: string = 'piyo'
	) {}
	get hoge(): number {
		return this._hoge;
	}
	set hoge(value: number) {
		this._hoge = value;
	}
}
console.log(CSV.stringify(new Test));
console.log(__dirname, process.cwd());
console.log(File.exists(__dirname + '/src/Index.ts'));
console.log(new Process);
