import * as CryptoJS from 'crypto-js';

export const encryptService = (key, value) => {
	const salt = '71@5g621#$dssfyuhkdf679.,?';

	let encryptedData = CryptoJS.AES.encrypt(JSON.stringify(value), salt);
	window['localStorage'].setItem(key, encryptedData);
};

export const decryptService = (key) => {
	const salt = '71@5g621#$dssfyuhkdf679.,?';
	const data = window['localStorage'].getItem(key);
	try {
		const unprocessedData = CryptoJS.AES.decrypt(data, salt);
		return JSON.parse(unprocessedData.toString(CryptoJS.enc.Utf8));
	} catch (error) {
		return false;
	}
};
