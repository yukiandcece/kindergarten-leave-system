const mysql = require('mysql2/promise');

const DEFAULT_PORT = 3306;
const DEFAULT_CHARSET = 'utf8mb4';
const DEFAULT_CONNECTION_LIMIT = 3;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`Missing required environment variable: ${name}`);
    error.statusCode = 500;
    throw error;
  }

  return value;
}

function getBaseConfig() {
  const port = Number.parseInt(process.env.DB_PORT || `${DEFAULT_PORT}`, 10);
  const connectionLimit = Number.parseInt(
    process.env.DB_CONNECTION_LIMIT || `${DEFAULT_CONNECTION_LIMIT}`,
    10
  );

  return {
    host: getRequiredEnv('DB_HOST'),
    port: Number.isFinite(port) ? port : DEFAULT_PORT,
    user: getRequiredEnv('DB_USER'),
    password: getRequiredEnv('DB_PASSWORD'),
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
