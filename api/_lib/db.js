const mysql = require('mysql2/promise');

const DEFAULT_PORT = 3306;
const DEFAULT_CHARSET = 'utf8mb4';
const DEFAULT_CONNECTION_LIMIT = 3;
const DEFAULT_DB_HOST = '47.97.213.134';
const DEFAULT_DB_USER = 'baicy';
const DEFAULT_DB_PASSWORD = 'baicy123';

function getBaseConfig() {
  const port = Number.parseInt(process.env.DB_PORT || `${DEFAULT_PORT}`, 10);
  const connectionLimit = Number.parseInt(
    process.env.DB_CONNECTION_LIMIT || `${DEFAULT_CONNECTION_LIMIT}`,
    10
  );

  return {
    host: process.env.DB_HOST || DEFAULT_DB_HOST,
    port: Number.isFinite(port) ? port : DEFAULT_PORT,
    user: process.env.DB_USER || DEFAULT_DB_USER,
    password: process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD,
    charset: process.env.DB_CHARSET || DEFAULT_CHARSET,
    waitForConnections: true,
    connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : DEFAULT_CONNECTION_LIMIT,
    queueLimit: 0
  };
}

function getPoolCache() {
  if (!globalThis.__kindergartenLeavePools) {
    globalThis.__kindergartenLeavePools = {};
  }

  return globalThis.__kindergartenLeavePools;
}

function getOrCreatePool(cacheKey, databaseName) {
  const cache = getPoolCache();

  if (!cache[cacheKey]) {
    cache[cacheKey] = mysql.createPool({
      ...getBaseConfig(),
      database: databaseName
    });
  }

  return cache[cacheKey];
}

function getJxtPool() {
  return getOrCreatePool('jxt', process.env.DB_JXT_NAME || 'jxt_dev');
}

function getUcenterPool() {
  return getOrCreatePool('ucenter', process.env.DB_UCENTER_NAME || 'ucenter_dev');
}

module.exports = {
  getJxtPool,
  getUcenterPool
};
