export const stringToUint8Array = (message: string) => {
	const encoder = new TextEncoder();
	return encoder.encode(message);
}

export const uint8ArrayToString = (array: Uint8Array) => {
	const decoder = new TextDecoder();
	return decoder.decode(array);
}

export const uint8ArrayToBase64 = (array: Uint8Array) => {
	return Buffer.from(array).toString('base64');
}

export const base64ToUint8Array = (base64String: string) => {
	return Uint8Array.from(Buffer.from(base64String, 'base64'));
}
