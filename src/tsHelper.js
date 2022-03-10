// @ts-check
const path = require('path');
const ts = require('typescript');
const fs = require('fs');

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot) {
    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
    return fileInfo.importedFiles
        .map(importedFile => importedFile.fileName)
        .filter(x => /^\./.test(x)) // remove non-relative imports
        .filter(x => !/.scss/.test(x)) // remove style imports
        .map(fileName => {
            if (/(^\.)/.test(fileName)) {
                return path.join(path.dirname(file), fileName);
            }

            return fileName;
        })
        .filter(fileName => !fileName.includes("node_modules"))
        .map(fileName => {
            if (fs.existsSync(`${fileName}`) && fs.lstatSync(fileName).isFile()) {
                return `${fileName}`;
            }
            if (fs.existsSync(`${fileName}.ts`)) {
                return `${fileName}.ts`;
            }
            if (fs.existsSync(`${fileName}.js`)) {
                return `${fileName}.js`;
            }
            if (fs.existsSync(`${fileName}.d.ts`)) {
                return `${fileName}.d.ts`;
            }
            if (fs.existsSync(`${fileName}.tsx`)) {
                return `${fileName}.tsx`;
            }
            if (fs.existsSync(`${fileName}/index.tsx`)) {
                return `${fileName}/index.tsx`;
            }
            if (fs.existsSync(`${fileName}/index.ts`)) {
                return `${fileName}/index.ts`;
            }
            if (fs.existsSync(`${fileName}/index.d.ts`)) {
                return `${fileName}/index.d.ts`;
            }

            console.warn(`Unresolved import ${fileName} in ${file}`);

            return null;
        })
        .filter(fileName => !!fileName);
};
