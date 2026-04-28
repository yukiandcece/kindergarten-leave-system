function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handlePreflight(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

function ensureGet(req, res) {
  if (req.method === 'GET') {
    return true;
  }

  res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });

  return false;
}

function getQueryValue(req, key) {
  if (req.query && typeof req.query[key] !== 'undefined') {
    return req.query[key];
  }

  return '';
}

module.exports = {
  ensureGet,
  getQueryValue,
  handlePreflight,
  setCorsHeaders
};
