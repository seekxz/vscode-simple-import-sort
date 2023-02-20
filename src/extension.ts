// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { sortedThirdPartyImportList, sortedAtImportList, sortedRelativeImportList} from './utils/index';

const getText = (): vscode.TextLine[] => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {return [];}

	const document = editor.document;
	const textList = [];
	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i);
		textList.push(line);
	}

	return textList;
};

/**
 * 
 * @param textList 
 * @returns 
 * import * as xxx from '';
 * import * as xxx from '@/';
 * import * as xxx from './';
 * import * as xxx from '../';* 
 * 
 * import {xxx} from 'xxx';
 * import {xxx} from '@/';
 * import {xxx} from '../';
 * import {xxx} from './';
 * 
 * import 'vue';
 * import './';
 * import '../';
 * 
 * import {
 * 		xxx,
 * 		xxx,
 * } from '';
 * 
 * const xxx = require('');
 * let xxx = require('@/');
 * let xxx = require('./');
 * let xxx = require('../');
 * 
 * 
	multi line import
	single line import
		* as import
			import * as xxx from ''
		url import
			import 'xxx/xxx'
		import 
			import {} from 'xx/'
			import xxx from 'xx'
		require
		 	require('xx/xx/')
			const xxx = require('../')
		code
			const xxx = 1;
			Vue.use(xxx)
 */
const getImportListInfo = (textList: vscode.TextLine[]): 
	[vscode.TextLine[], vscode.TextLine[], vscode.TextLine[], vscode.TextLine[], number, number] => {

	// multi line import 
	const importLinesList = [];
	// single line import
	const importList = [];
	// require
	const requireList = [];
	// code
	const codeList = [];

	// start index
	let startIndex = -1;
	// end
	let endIndex = Infinity;

	const importLinesReg = /(\/\/\s*)?import\s+{\s*(\/\/.*)?$/;
	const requireReg = /(\/\/\s*)?[const|let]?\s*.*?\s*=?\s*require\(['|"].*?['|"]\);?.*/;
	const urlImportReg = /(\/\/\s*)?(?<!@)import\s+['|"].+['|"];?.*/; 
	const importReg = /(\/\/\s*)?import\s+.*?from\s+['|"].*?['|"];?.*/;

	let isCodeFlag = true;

	for (let i = 0; i < textList.length; i++) {
		const line = textList[i];

		const isImport = importLinesReg.test(line.text) || requireReg.test(line.text) || urlImportReg.test(line.text) || importReg.test(line.text);
		
		if (isImport && startIndex === -1) {
			startIndex = i;
		}
		
		if (importLinesReg.test(line.text)) {
			const start = i;
			const end = textList.findIndex((item, index) => {
				const reg = /}\s*from\s*/;
				return index > i && reg.test(item.text);
			});

			if (end === -1) {
				break;
			}

			const importLines = textList.slice(start, end + 1);
			importLinesList.push(...importLines);

			endIndex = i + (end+1 - start);
			i = endIndex - 1;
			isCodeFlag = false;
		} else if (requireReg.test(line.text)) {
			requireList.push(line);
			endIndex = i;
			isCodeFlag = false;
		} else if (urlImportReg.test(line.text) || importReg.test(line.text)) {
			importList.push(line);
			endIndex = i;
			isCodeFlag = false;
		} else {
			if (!isCodeFlag) {
				const emptyLineReg = /^\s*$/;
				if (emptyLineReg.test(line.text)) {
					endIndex = i;
					continue;
				}

				const nextLine = textList[i];
				if (nextLine && isImport) {
					codeList.push(line);
				}
				
				endIndex = i;
				isCodeFlag = true;
			} else {
				if (endIndex < i) {
					break;
				}
			}
		}
	}

	return [importLinesList, requireList, importList, codeList, startIndex, endIndex];
}; 

/**
 * Sort the import list by the path of the imported file 
 * @param importList 
 * 
 * npm package
 * @/ file
 * ./ or ../ file
 * Introduction of .css, .less, .sass, .scss, .style 
 */
const parseImportList = (importList: vscode.TextLine[]) => {
	let thirdPartyImportList = [];
	let atImportList = [];
	let relativeImportList = [];
	let cssImportList = [];

	const thiredPartyImportReg = /(\/\/\s*)?import\s+?.*?from\s+['|"][a-zA-Z].*?['|"];?.*/;
	const atImportReg = /(\/\/\s*)?import\s+?.*?from\s+['|"]@.*?['|"];?.*/;
	// const relativeImportReg = /(\/\/\s*)?import\s+?.*?from\s+['|"]\..*?['|"];?.*/;
	const relativeImportReg = /(\/\/\s*)?(?<!@)import\s+.*['|"].*?['|"];?.*/;
	const cssImportReg = /(\/\/\s*)?import\s*['|"].*\.[css|less|sass|scss|styl].*?['|"];?.*/;

	for (let i = 0; i < importList.length; i++) {
		const line = importList[i];
		if (thiredPartyImportReg.test(line.text)) {
			thirdPartyImportList.push(line);
		} else if (atImportReg.test(line.text)) {
			atImportList.push(line);
		} else if (cssImportReg.test(line.text)) {
			cssImportList.push(line);
		} else if (relativeImportReg.test(line.text)) {
			relativeImportList.push(line);
		}
	}

	thirdPartyImportList = sortedThirdPartyImportList(thirdPartyImportList);
	atImportList = sortedAtImportList(atImportList);
	relativeImportList = sortedRelativeImportList(relativeImportList);

	const sortedImportList = [
		...thirdPartyImportList,
		(thirdPartyImportList.length > 0 ? '\n' : ''),
		...atImportList,
		(atImportList.length > 0 ? '\n' : ''),
		...relativeImportList,
		(relativeImportList.length > 0 ? '\n' : ''),
		...cssImportList,
	].filter(item => item);

	if (sortedImportList[sortedImportList.length - 1] === '\n') {
		sortedImportList.pop();
	}

	return sortedImportList;
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "simple-import-sort" is now active!');

	const disposable = vscode.commands.registerCommand('simple-import-sort.sortImport', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {return;}

		const document = editor.document;
		const textList = getText();
		const [importLinesList, requireList, importList, codeList, startIndex, endIndex] = getImportListInfo(textList); 

		if (importLinesList.length === 0 && requireList.length === 0 && importList.length === 0) {
			document.save();
			return;
		}

		const sortedImportList = parseImportList(importList);
		const endLine = textList.slice(endIndex)[0];
		const allImportList = [...importLinesList, ...sortedImportList, ...requireList, ...codeList];

		// if the last line is not empty, you need to add an empty line
		if (endLine && endLine.text !== '\n') {
			allImportList.push('\n');
			allImportList.push('\n');
		}

		const text = allImportList.map((item) => (item as any)?.text).join('\n');
		editor.edit((editBuilder) => {
			editBuilder.replace(new vscode.Range(startIndex, 0, endIndex, 0), text);
		});

		document.save();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
