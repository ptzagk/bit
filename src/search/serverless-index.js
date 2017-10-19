/** @flow */
import path from 'path';
import fs from 'fs-extra';
import levelup from 'levelup';
import searchIndex from 'search-index';
import jsondown from 'jsondown';
import logger from '../logger/logger';

const indexName = 'search_index.json';
const logLevel = 'error';
let index: Promise<any>;

function getIndexPath(scopePath: string) {
  return path.join(scopePath, indexName);
}

function deleteDb(scopePath: string) {
  const indexPath = getIndexPath(scopePath);
  logger.debug(`deleting index-search at ${indexPath}`);
  if (!scopePath || !indexPath) return;
  fs.removeSync(indexPath);
}

async function initializeIndex(scopePath: string): Promise<any> {
  if (!index) {
    const db = levelup(getIndexPath(scopePath), { db: jsondown });

    // static var to make sure the index is not instantiated twice
    const indexOptions = {
      indexPath: getIndexPath(scopePath),
      logLevel,
      indexes: db,
      stopwords: []
    };

    index = new Promise((resolve, reject) => {
      searchIndex(indexOptions, (err, si) => {
        if (err) reject(err);
        resolve(si);
      });
    });
  }

  return index;
}

module.exports = {
  deleteDb,
  getIndexPath,
  initializeIndex
};
