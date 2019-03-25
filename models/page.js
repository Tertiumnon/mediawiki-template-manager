const fs = require('fs');

module.exports = class Page {
  constructor(props) {
    this.name = props.name;
    this.text = props.text;
  }

  static getFileNameFromPath(filePath) {
    const filePathParts = filePath.split('/');
    let res = filePathParts.pop();
    res = res
      .replace(' - ', ':')
      .replace('_-_', ':')
      .replace('.html', '')
      .replace('.htm', '')
      .replace('.md', '')
      .replace('.mw', '')
      .replace('.mediawiki', '')
      .replace('.wiki', '');
    return res;
  }

  static getFileContent(filePath) {
    const res = fs.readFileSync(filePath, 'utf-8');
    return res;
  }
};
