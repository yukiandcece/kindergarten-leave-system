/**
 * 超简单Node.js方案 - 直接连接数据库并渲染页面
 * 一个文件搞定所有功能
 */

const mysql = require('mysql2/promise');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev'
};

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  // 处理CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: 查询学生联系人
  if (req.url === '/api/contacts' && req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 100;
      const offset = (page - 1) * pageSize;

      const connection = await mysql.createConnection(dbConfig);

      try {
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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: rows,
          pagination: {
            page,
            pageSize,
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / pageSize)
          }
        }));
      } finally {
        await connection.end();
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: error.message
      }));
    }
    return;
  }

  // API: 根据ID查询单个联系人
  if (req.url.startsWith('/api/contact/') && req.method === 'GET') {
    try {
      const id = req.url.split('/').pop();
      const connection = await mysql.createConnection(dbConfig);

      try {
        const [rows] = await connection.execute(`
          SELECT id, cellphone FROM tbl_jxt_student_contact WHERE id = ?
        `, [id]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: rows.length > 0 ? rows[0] : null
        }));
      } finally {
        await connection.end();
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: error.message
      }));
    }
    return;
  }

  // 静态文件服务
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  ✅ Node.js服务器启动成功！                     ║
╠════════════════════════════════════════════════╣
║  📱 页面地址: http://localhost:${PORT}           ║
║  🔌 API接口:  http://localhost:${PORT}/api/     ║
╚════════════════════════════════════════════════╝

  按 Ctrl+C 停止服务器
  `);
});
