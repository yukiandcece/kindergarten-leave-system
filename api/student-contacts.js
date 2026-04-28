// Vercel Edge Function / Netlify Function
// 文件路径: api/student-contacts.js

const mysql = require('mysql2/promise');

export default async function handler(req, res) {
  // CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const connection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'jxt_dev'
  });

  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const offset = (page - 1) * pageSize;

    const [rows] = await connection.execute(`
      SELECT id, cellphone FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
    `);

    res.status(200).json({
      success: true,
      data: rows,
      total: countResult[0].total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    await connection.end();
  }
}
