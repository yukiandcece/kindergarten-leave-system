const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors()); // 允许前端跨域访问
app.use(express.json());

// 数据库配置
const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev',
  charset: 'utf8mb4'
};

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * API: 查询学生联系人信息
 * GET /api/student-contacts
 * Query参数:
 *   - page: 页码（默认1）
 *   - pageSize: 每页条数（默认100）
 */
app.get('/api/student-contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const offset = (page - 1) * pageSize;

    // 查询数据
    const [rows] = await pool.execute(`
      SELECT id, cellphone
      FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL
        AND cellphone != ''
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    // 查询总数
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL
        AND cellphone != ''
    `);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('查询错误:', error);
    res.status(500).json({
      success: false,
      message: '查询失败',
      error: error.message
    });
  }
});

/**
 * API: 根据ID查询单个联系人
 * GET /api/student-contacts/:id
 */
app.get('/api/student-contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT id, cellphone
      FROM tbl_jxt_student_contact
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该记录'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('查询错误:', error);
    res.status(500).json({
      success: false,
      message: '查询失败',
      error: error.message
    });
  }
});

/**
 * API: 健康检查
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 接口地址: http://localhost:${PORT}/api/student-contacts`);
});
