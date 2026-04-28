const { getJxtPool } = require('./_lib/db');
const { ensureGet, getQueryValue, handlePreflight, setCorsHeaders } = require('./_lib/http');

module.exports = async function handler(req, res) {
  if (handlePreflight(req, res)) {
    return;
  }

  setCorsHeaders(res);

  if (!ensureGet(req, res)) {
    return;
  }

  try {
    const page = Math.max(1, Number.parseInt(getQueryValue(req, 'page') || '1', 10) || 1);
    const pageSize = Math.min(
      500,
      Math.max(1, Number.parseInt(getQueryValue(req, 'pageSize') || '100', 10) || 100)
    );
    const offset = (page - 1) * pageSize;
    const pool = getJxtPool();

    const [rows] = await pool.execute(
      `
        SELECT id, cellphone
        FROM tbl_jxt_student_contact
        WHERE cellphone IS NOT NULL AND cellphone != ''
        ORDER BY id ASC
        LIMIT ? OFFSET ?
      `,
      [pageSize, offset]
    );

    const [countResult] = await pool.execute(
      `
        SELECT COUNT(*) AS total
        FROM tbl_jxt_student_contact
        WHERE cellphone IS NOT NULL AND cellphone != ''
      `
    );

    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to query student contacts'
    });
  }
};
