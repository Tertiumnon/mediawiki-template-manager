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
  async downloadAll() {
    console.log('init data');
    const { dataPath } = this;
    this.initLS(dataPath);
    try {
      await this.getMWEditToken();
      await this.getAllMediawikis();
      await this.getAllTemplates();
      await this.getAllHelps();
      await this.getAllCategories();
      await this.getAllProperties();
      await this.getAllForms();
      await this.getAllConcepts();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Get all MediaWiki pages
   * @returns {Promise}
   */
  getAllMediawikis() {
    console.log('Get all MediaWiki pages...');
    return this.getRSPagesByNS({ ns: 8 });
  }

  /**
   * Get all Template pages
   * @returns {Promise}
   */
  getAllTemplates() {
    console.log('Get all Template pages...');
    return this.getRSPagesByNS({ ns: 10 });
  }

  /**
   * Get all Help pages
   * @returns {Promise}
   */
  getAllHelps() {
    console.log('Get all Help pages...');
    return this.getRSPagesByNS({ ns: 12 });
  }

  /**
   * Get all Category pages
   * @returns {Promise}
   */
  getAllCategories() {
    console.log('Get all Category pages...');
    return this.getRSPagesByNS({ ns: 14 });
  }

  /**
   * Get all Property pages
   * @returns {Promise}
   */
  getAllProperties() {
    console.log('Get all Property pages...');
    return this.getRSPagesByNS({ ns: 102 });
  }

  /**
   * Get all Form pages
   * @returns {Promise}
   */
  getAllForms() {
    console.log('Get all Form pages...');
    return this.getRSPagesByNS({ ns: 106 });
  }

  /**
   * Get all Concept pages
   * @returns {Promise}
   */
  getAllConcepts() {
    console.log('Get all Concept pages...');
    return this.getRSPagesByNS({ ns: 108 });
  }

  /**
   * Download pages from Remote Storage by Namespace
   * @param {Object} params
   * @param {String} params.ns Неймспейс
   * @returns {Promise}
   */
  async getRSPagesByNS(params) {
    try {
      const response = await this.bot.request({
        action: 'query',
        list: 'allpages',
        apnamespace: params.ns,
        aplimit: '5000',
      });
      if (response.continue) {
        throw new Error('Parameter "continue" exists.');
      }
      if (
        response.query
        && response.query.allpages
        && response.query.allpages.length > 0
      ) {
        const data = response.query.allpages.filter(
          r => r.title !== '' && r.title.search('/') === -1,
        );
        await this.downloadPages(data.map(p => p.title));
        this.data = [...this.data, ...data];
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Delete not existing Local Storage pages
   */
  deleteNotExistLSPages() {
    console.log('Delete not existing Local Storage pages');
    const pagenames = [
      this.localData.map(o => o.title),
      this.data.map(o => o.title),
    ];
    const diffPagenames = pagenames.reduce((a, b) => a.filter(c => !b.includes(c)));
    if (diffPagenames.length > 0) {
      diffPagenames.forEach((pagename) => {
        const filePath = `${this.dataPath}/${
          this.localData.filter(p => p.title === pagename)[0].path
        }`;
        fs.unlinkSync(filePath);
      });
    }
  }

  /**
   * Get PageList
   * @returns {String[]}
   */
  getPageList() {
    return this.data.map(p => p.title);
  }

  /**
   * Save pages to Local Storage
   * @param {Object} response
   */
  savePagesToLS(response) {
    console.log('Save pages to Local Storage...');
    if (response.query && response.query.pages) {
      const ids = Object.keys(response.query.pages);
      ids.forEach((id) => {
        const pagename = response.query.pages[id].title;
        const content = response.query.pages[id].revisions
          ? response.query.pages[id].revisions[0]['*']
          : '';
        if (!content) {
          console.log(`No content for: ${pagename}`);
        } else {
          const path = this.getPathByName(pagename);
          // console.log(path);
          this.savePageToLS({ pagename, path, content });
        }
      });
    }
  }

  /**
   * Get MediaWiki Edit Token
   */
  async getMWEditToken() {
    await this.bot.loginGetEditToken({
      apiUrl: this.apiURL,
      username: this.botData.user,
      password: this.botData.password,
    });
  }

  /**
   * Download page or pages by pagename
   * @param {String[]} pagenames
   */
  async downloadPages(pagenames) {
    console.log('Download pages...');
    let read = [];
    const l = pagenames.length;
    if (l > 500) {
      const parts = l / 500;
      const promises = [];
      for (let i = 0; i < Math.ceil(parts); i += 1) {
        const j = i > 0 ? i * 500 : i;
        const pns = pagenames.slice(j, (j + 500));
        promises.push(this.bot.read(pns.join('|'), { timeout: 8000 }));
      }
      const readAll = await Promise.all(promises);
      readAll.forEach((item) => {
        read = { ...read, ...item };
        this.savePagesToLS(read);
      });
    } else {
      read = { ...read, ...await this.bot.read(pagenames.join('|'), { timeout: 8000 }) };
      this.savePagesToLS(read);
    }
  }

  /**
   * Write content to file
   * @param {Object} params
   * @param {String} params.path Path to save
   * @param {String} params.content Content
   */
  savePageToLS(params) {
    const { path, content } = params;
    fs.writeFile(
      `${this.dataPath}/${path}`,
      content,
      { encoding: 'utf8', flag: 'w' },
      (err) => {
        if (err) throw err;
        // console.log(`${this.dataPath}/${path} -> saved!`);
      },
    );
  }

  /**
   * Get path by pagename
   * @param {String} pagename
   * @returns
   */
  getPathByName(pagename) {
    const page = this.data.find(p => escape(p.name) === escape(pagename));
    return page && page.path
      ? page.path
      : `${Page.getFilenameByPagename(pagename)}`;
  }

  /**
   * Init Local Storage
   * @param {String} dir
   */
  initLS(dir) {
    console.log('init local data...');
    fs.readdirSync(dir).forEach((item) => {
      if (fs.lstatSync(`${dir}/${item}`, { encoding: 'utf8' }).isFile()) {
        this.localData.push({
          title: Page.getPagenameByFilepath(`${dir}/${item}`),
          path: `${dir}/${item}`.replace(`${this.dataPath}/`, ''),
        });
      } else if (this.ignoredPaths.indexOf(item) === -1) {
        this.initLS(`${dir}/${item}`);
      }
    });
  }
};
