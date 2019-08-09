const fs = require('fs');

/** Wiki page */
module.exports = class Page {
  /**
   * Creates an instance of Page
   * @param {Object} props
   * @param {String} props.name
   * @param {String} props.text
   */
  constructor(props) {
    this.name = props.name;
    this.text = props.text;
  }

  /**
   * Get page name from path
   * @static
   * @param {String} filePath Path to file
   * @returns {String}
   */
  static getPagenameByFilepath(filePath) {
    const filePathParts = filePath.split('/');
    let res = filePathParts.pop();
    res = res
      .replace('_--_', ':')
      .replace(/_/g, ' ')
      .replace('.html', '')
      .replace('.htm', '')
      .replace('.md', '')
      .replace('.mw', '')
      .replace('.mediawiki', '')
      .replace('.wiki', '');
    return res;
  }

  /**
   * Get file name from page name
   * @static
   * @param {String} pagename
   * @returns {String}
   */
  static getFilenameByPagename(pagename) {
    const res = pagename
      .replace(':', '_--_')
      .replace(/ /g, '_');
    return `${res}.html`;
  }

  /**
   * Get content from file by path
   * @static
   * @param {String} filePath Path to file
   * @returns {String}
   */
  static getFileContent(filePath) {
    const res = fs.readFileSync(filePath, 'utf-8');
    return res;
  }
};
