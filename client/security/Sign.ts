import * as CryptoJS from 'crypto-js';

export default class Sign {
	public static digest(...args: any[]): string {
		return CryptoJS.HmacSHA1(JSON.stringify(args), '=imJNvjC0<!b!eq?CMO~PW{uw*N;,Tv3').toString();
	}
}
