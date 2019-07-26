const fs = require('fs');

/** Wiki page */
module.exports = class Page {
  /**
   * Creates an instance of Page
   * @param {*} props
   */
  constructor(props) {
    this.name = props.name;
    this.text = props.text;
  }

  /**
   * Get file name from path
   * @static
   * @param {string} filePath Path to file
   * @returns {string}
   */
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

  /**
   * Get content from file by path
   * @static
   * @param {string} filePath Path to file
   * @returns {string}
   */
  static getFileContent(filePath) {
    const res = fs.readFileSync(filePath, 'utf-8');
    return res;
  }
};
