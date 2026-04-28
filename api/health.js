const { getJxtPool, getUcenterPool } = require('./_lib/db');
const { ensureGet, handlePreflight, setCorsHeaders } = require('./_lib/http');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!ensureGet(req, res)) {
    return;
  }

  try {
    const jxtPool = getJxtPool();
    const ucenterPool = getUcenterPool();

    await Promise.all([jxtPool.query('SELECT 1'), ucenterPool.query('SELECT 1')]);

    res.status(200).json({
      success: true,
      message: 'API and database connections are healthy'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Health check failed'
    });
  }
};
