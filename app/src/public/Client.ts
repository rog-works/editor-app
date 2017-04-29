import WS from './net/WS';
import Page from './components/Page';
import Console from './models/Console';
import Shell from './models/Shell';
import Weblog from './models/Weblog';
import Dialog from './models/Dialog';
import Editor from './models/Editor';

console.log(new WS('ws://localhost:8080'), new Page(null));
console.log(new Console, new Shell, new Weblog);
console.log(new Dialog, new Editor);
