export const generateChunks = (input: string): Array<string> => {
	return input
		.trim()
		.split('.')
		.filter((s) => s !== '');
};
