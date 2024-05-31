import { codeToHtml } from 'shiki';
export default async function highlight(code: string) {
	return (
		await codeToHtml(code, {
			lang: 'yaml',
			theme: 'github-light'
		})
	).replaceAll(/background-color:\#[0-9a-fA-F]*;/g, '');
}
