/* eslint-disable no-console */
const fs = require('fs');
const MWBot = require('mwbot');
const Page = require('../page/page');

/**
 * Page Storage (local files)
 */
module.exports = class PageStorage {
  /**
   * Creates an instance of PageStorage.
   * @param {Object} params
   * @param {String} params.dataPath Pages location
   * @param {String} params.apiURL API URL
   * @param {Object} params.botData Bot credentials
   * @param {Object} params.botData.login
   * @param {Object} params.botData.password
   */
  constructor(params) {
    this.dataPath = params.dataPath;
    this.apiURL = params.apiURL;
    this.ignoredPaths = [];
    this.localData = [];
    this.data = [];
    // bot
    this.botData = params.botData;
    this.bot = new MWBot({
      apiUrl: this.apiURL,
    });
  }

  /**
   * Get all data
   * @returns {Promise}
   */
  init() {
    console.log('init data');
    const { dataPath } = this;
    this.initLocalData(dataPath);
    return this.getAllMediawikis()
      .then(() => this.getAllTemplates())
      .then(() => this.getAllHelps())
      .then(() => this.getAllCategories())
      .then(() => this.getAllProperties())
      .then(() => this.getAllForms())
      .then(() => this.getAllConcepts())
      .catch((err) => {
        console.log(err);
      });
  }


  /**
   * Get all pages from namespace MediaWiki
   * @returns {Promise}
   */
  getAllMediawikis() {
    return this.getAllPages({ ns: 8 });
  }

  /**
   * Get all pages from namespace Template
   * @returns {Promise}
   */
  getAllTemplates() {
    return this.getAllPages({ ns: 10 });
  }

  /**
   * Get all pages from namespace Help
   * @returns {Promise}
   */
  getAllHelps() {
    return this.getAllPages({ ns: 12 });
  }

  /**
   * Get all pages from namespace Category
   * @returns {Promise}
   */
  getAllCategories() {
    return this.getAllPages({ ns: 14 });
  }

  /**
   * Get all pages from namespace Property
   * @returns {Promise}
   */
  getAllProperties() {
    return this.getAllPages({ ns: 102 });
  }

  /**
   * Get all pages from namespace Form
   * @returns {Promise}
   */
  getAllForms() {
    return this.getAllPages({ ns: 106 });
  }

  /**
   * Get all pages from namespace Concept
   * @returns {Promise}
   */
  getAllConcepts() {
    return this.getAllPages({ ns: 108 });
  }

  /**
   * Get pages
   * @param {Object} params
   * @param {String} params.ns Неймспейс
   * @returns {Promise}
   */
  getAllPages(params) {
    return this.bot.loginGetEditToken({
      apiUrl: this.apiURL,
      username: this.botData.user,
      password: this.botData.password,
    })
      .then(() => this.bot.request({
        action: 'query',
        list: 'allpages',
        apnamespace: params.ns,
        aplimit: '5000',
      }))
      .then((response) => {
        if (response.continue) {
          console.warn('There are too much pages!', params);
        }
        if (response.query && response.query.allpages && response.query.allpages.length > 0) {
          const data = response.query.allpages.filter(r => (r.title !== '' && r.title.search('/') === -1));
          this.download(data.map(p => p.title));
          this.data = [...this.data, ...data];
          return true;
        }
        return false;
      }).catch((err) => {
        console.log(err);
      });
  }

  removeNotExistLocalPages() {
    console.log('remove not existing local pages');
    const pagenames = [this.localData.map(o => o.title), this.data.map(o => o.title)];
    const diffPagenames = pagenames.reduce((a, b) => a.filter(c => !b.includes(c)));
    if (diffPagenames.length > 0) {
      diffPagenames.forEach((pagename) => {
        const filePath = `${this.dataPath}/${this.localData.filter(p => p.title === pagename)[0].path}`;
        fs.unlinkSync(filePath);
      });
    }
  }

  /**
   * Get pages list
   * @returns {String[]}
   */
  getPageList() {
    return this.data.map(p => p.title);
  }

  /**
   * Download page or pages
   * @param {String[]} pagenames
   */
  download(pagenames) {
    console.log('download data');
    this.bot.loginGetEditToken({
      apiUrl: this.apiURL,
      username: this.botData.user,
      password: this.botData.password,
    }).then(() => this.bot.read(pagenames.join('|'), { timeout: 8000 }).then((response) => {
      const ids = Object.keys(response.query.pages);
      ids.forEach((id) => {
        const pagename = response.query.pages[id].title;
        const content = response.query.pages[id].revisions ? response.query.pages[id].revisions[0]['*'] : '';
        if (content === undefined) {
          console.log(`There's no content for: ${pagename}`);
        }
        const path = this.getPathByName(pagename);
        this.savePageToStorage({ pagename, path, content });
      });
    }).catch((err) => {
      console.log(err);
    }));
  }

  /**
   * Write content to file
   * @param {Object} params
   * @param {String} params.path Path to save
   * @param {String} params.content Content
   */
  savePageToStorage(params) {
    const { path, content } = params;
    fs.writeFile(`${this.dataPath}/${path}`, content, { encoding: 'utf8', flag: 'w' }, (err) => {
      if (err) throw err;
      console.log(`${this.dataPath}/${path} -> saved!`);
    });
  }

  /**
   * Get path by page name
   * @param {String} pagename
   * @returns
   */
  getPathByName(pagename) {
    const page = this.data.find(p => escape(p.name) === escape(pagename));
    return page && page.path ? page.path : `${Page.getFilenameByPagename(pagename)}`;
  }

  /**
   * Get pages saved locally
   * @param {String} dir
   */
  initLocalData(dir) {
    console.log('init local data');
    fs.readdirSync(dir).forEach((item) => {
      if (fs.lstatSync(`${dir}/${item}`, { encoding: 'utf8' }).isFile()) {
        this.localData.push({
          title: Page.getPagenameByFilepath(`${dir}/${item}`),
          path: (`${dir}/${item}`).replace(`${this.dataPath}/`, ''),
        });
      } else if (this.ignoredPaths.indexOf(item) === -1) {
        this.initLocalData(`${dir}/${item}`);
      }
    });
  }
};
