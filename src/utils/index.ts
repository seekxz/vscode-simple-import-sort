import * as vscode from 'vscode';

const sortedThirdPartyImportList = (importList: vscode.TextLine[]) => {
  if (importList.length <= 1) {return importList;}

  return importList.sort((a, b) => {
    const reg = /from\s+['|"](.*)['|"]/;
    const aName = a?.text.match(reg)?.[1];
    const bName = b?.text.match(reg)?.[1];
    
    return (aName as string).localeCompare(bName as string);
  });
};

const sortedAtImportList = (importList: vscode.TextLine[]) => {
  if (importList.length <= 1) {return importList;}

  return importList.sort((a, b) => {
    const aName = a?.text.split(' ')[1];
    const bName = b?.text.split(' ')[1];
    return (aName as string).localeCompare(bName as string);
  });
};

const sortedRelativeImportList = (importList: vscode.TextLine[]) => {
  if (importList.length <= 1) {return importList;} 

  return importList.sort((a, b) => {
    const reg = /from\s+['|"](.*)['|"]/;
    const aName = a?.text.match(reg)?.[1];
    const bName = b?.text.match(reg)?.[1];
    const aLevel = aName?.split('/').length;
    const bLevel = bName?.split('/').length;

    if (aLevel === bLevel) {
      return (aName as string).localeCompare(bName as string);
    }
    return (bLevel as number) - (aLevel as number);
  });
};

export { sortedThirdPartyImportList, sortedAtImportList, sortedRelativeImportList};
