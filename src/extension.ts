// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
	CancellationToken,
	FoldingContext,
	FoldingRange,
	FoldingRangeProvider,
	ProviderResult,
	TextDocument,
} from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "helloworld" is now active!');

	const selector = { scheme: 'file', language: 'php' };
	const provider = new CommentProvider();
	vscode.languages.registerFoldingRangeProvider(selector, provider);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello world!');
	// });

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

class CommentProvider implements FoldingRangeProvider {
	provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken): ProviderResult<FoldingRange[]> {
		let inBlockComment = false;
		const starts = [];
		const ranges = [];

		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i).text;

			for (let j = 0; j < line.length; j++) {
				if (!inBlockComment && line[j] === '/' && line[j + 1] === '/') {
					break;
				}

				if (!inBlockComment && line[j] === '/' && line[j + 1] === '*') {
					starts.push(i);
					inBlockComment = true;
				}
				if (inBlockComment && line[j] === '*' && line[j + 1] === '/') {
					if (starts.length > 0) {
						const start = starts.pop()!;
						const end = i - 1;
						ranges.push({ start, end });
						inBlockComment = false;
					}
				}

				if (!inBlockComment && line[j] === '{') {
					starts.push(i);
				}
				if (!inBlockComment && line[j] === '}') {
					if (starts.length > 0) {
						const start = starts.pop()!;
						const end = i - 1;
						ranges.push({ start, end });
					}
				}
			}
		}

		return ranges.map(x => new FoldingRange(x.start, x.end));
	}
}
