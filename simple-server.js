/**
 * 一键启动服务器 - 同时提供前端页面和API接口
 * 无需单独部署后端，一个文件搞定
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 托管静态前端文件
app.use(express.static(__dirname));

// 数据库连接池
const pool = mysql.createPool({
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API路由
app.get('/api/student-contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.execute(`
      SELECT id, cellphone FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
    `);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API: 根据学生姓名搜索学生及接送人信息
app.get('/api/students/search', async (req, res) => {
  let ucenterConnection = null;
  let jxtConnection = null;

  try {
    const searchName = req.query.name || '';

    // 输入验证
    if (!searchName.trim()) {
      return res.json({
        success: false,
        message: '请输入搜索关键词'
      });
    }

    // 验证搜索关键词长度
    if (searchName.length > 50) {
      return res.json({
        success: false,
        message: '搜索关键词过长'
      });
    }

    // 创建ucenter_dev数据库连接
    ucenterConnection = await mysql.createConnection({
      host: '47.97.213.134',
      port: 3306,
      user: 'baicy',
      password: 'baicy123',
      database: 'ucenter_dev',
      charset: 'utf8mb4'
    });

    // 创建jxt_dev数据库连接
    jxtConnection = await mysql.createConnection({
      host: '47.97.213.134',
      port: 3306,
      user: 'baicy',
      password: 'baicy123',
      database: 'jxt_dev',
      charset: 'utf8mb4'
    });

    let students = [];
    let result = [];

    // 判断输入是电话号码还是姓名（电话号码：纯数字且长度7-15位）
    const isPhoneNumber = /^\d{7,15}$/.test(searchName.trim());

    if (isPhoneNumber) {
      // 通过电话号码搜索
      console.log(`通过电话号码搜索: ${searchName}`);

      const [contacts] = await jxtConnection.execute(`
        SELECT student_id, parent_name, cellphone, parent_role
        FROM tbl_jxt_student_contact
        WHERE cellphone = ?
          AND valid_status = 1
          AND cellphone IS NOT NULL
          AND cellphone != ''
      `, [searchName.trim()]);

      if (contacts.length === 0) {
        return res.json({
          success: true,
          message: '未找到该电话号码对应的家长信息',
          data: []
        });
      }

      // 获取学生ID列表
      const studentIds = [...new Set(contacts.map(c => c.student_id))];

      // 查询学生信息
      const placeholders = studentIds.map(() => '?').join(',');
      const [studentsData] = await ucenterConnection.execute(`
        SELECT id, student_name
        FROM tbl_ucenter_student
        WHERE id IN (${placeholders})
          AND student_status = 1
      `, studentIds);

      // 组装数据
      result = studentsData.map(student => {
        const studentContacts = contacts.filter(c => c.student_id === student.id);
        return {
          id: student.id,
          student_name: student.student_name,
          contacts: studentContacts.map(c => ({
            parent_name: c.parent_name,
            cellphone: c.cellphone,
            relation: c.parent_role
          }))
        };
      });

    } else {
      // 通过学生姓名搜索
      console.log(`通过学生姓名搜索: ${searchName}`);

      // 查询学生信息
      const [studentsData] = await ucenterConnection.execute(`
        SELECT id, student_name
        FROM tbl_ucenter_student
        WHERE student_name LIKE ?
          AND student_status = 1
        ORDER BY id
      `, [`%${searchName}%`]);

      if (studentsData.length === 0) {
        return res.json({
          success: true,
          message: '未找到匹配的学生',
          data: []
        });
      }

      // 获取学生ID列表
      const studentIds = studentsData.map(s => s.id);

      // 查询接送人信息
      const placeholders = studentIds.map(() => '?').join(',');
      const [contacts] = await jxtConnection.execute(`
        SELECT student_id, parent_name, cellphone, parent_role
        FROM tbl_jxt_student_contact
        WHERE student_id IN (${placeholders})
          AND valid_status = 1
          AND cellphone IS NOT NULL
          AND cellphone != ''
        ORDER BY student_id, parent_role
      `, studentIds);

      // 组装数据
      result = studentsData.map(student => {
        const studentContacts = contacts.filter(c => c.student_id === student.id);
        return {
          id: student.id,
          student_name: student.student_name,
          contacts: studentContacts.map(c => ({
            parent_name: c.parent_name,
            cellphone: c.cellphone,
            relation: c.parent_role
          }))
        };
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试'
    });
  } finally {
    // 确保关闭数据库连接
    if (ucenterConnection) {
      await ucenterConnection.end();
    }
    if (jxtConnection) {
      await jxtConnection.end();
    }
  }
});

// API: 根据NFC ID搜索学生及接送人信息
app.get('/api/students/nfc-search', async (req, res) => {
  let ucenterConnection = null;
  let jxtConnection = null;

  try {
    const nfcId = req.query.nfc_id || '';

    // 验证NFC ID格式: {数字}_{数字}
    if (!/^\d+_\d{7,15}$/.test(nfcId)) {
      return res.json({
        success: false,
        message: 'NFC ID格式错误，应为 {学生ID}_{手机号}'
      });
    }

    // 解析NFC ID
    const [studentId, cellphone] = nfcId.split('_');

    // 创建数据库连接
    ucenterConnection = await mysql.createConnection({
      host: '47.97.213.134',
      port: 3306,
      user: 'baicy',
      password: 'baicy123',
      database: 'ucenter_dev',
      charset: 'utf8mb4'
    });

    jxtConnection = await mysql.createConnection({
      host: '47.97.213.134',
      port: 3306,
      user: 'baicy',
      password: 'baicy123',
      database: 'jxt_dev',
      charset: 'utf8mb4'
    });

    // 查询学生信息
    const [students] = await ucenterConnection.execute(`
      SELECT id, student_name
      FROM tbl_ucenter_student
      WHERE id = ? AND student_status = 1
    `, [studentId]);

    if (students.length === 0) {
      return res.json({
        success: true,
        message: '未找到该学生',
        data: []
      });
    }

    const student = students[0];

    // 查询所有接送人
    const [contacts] = await jxtConnection.execute(`
      SELECT student_id, parent_name, cellphone, parent_role
      FROM tbl_jxt_student_contact
      WHERE student_id = ?
        AND valid_status = 1
        AND cellphone IS NOT NULL
        AND cellphone != ''
      ORDER BY parent_role
    `, [studentId]);

    // 组装数据，标记完全匹配的记录
    const result = {
      id: student.id,
      student_name: student.student_name,
      contacts: contacts.map(c => ({
        parent_name: c.parent_name || '',
        cellphone: c.cellphone,
        parent_role: c.parent_role,
        isMatch: c.cellphone === cellphone // 高亮标记
      }))
    };

    res.json({
      success: true,
      data: [result]
    });

  } catch (error) {
    console.error('NFC搜索错误:', error);
    res.status(500).json({
      success: false,
      message: '查询失败，请稍后重试'
    });
  } finally {
    if (ucenterConnection) {
      await ucenterConnection.end();
    }
    if (jxtConnection) {
      await jxtConnection.end();
    }
  }
});

// 所有其他请求返回前端页面
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🎉 服务启动成功！                               ║
╠════════════════════════════════════════════════╣
║  📱 前端页面: http://localhost:${PORT}           ║
║  🔌 API接口:  http://localhost:${PORT}/api       ║
╚════════════════════════════════════════════════╝

  访问页面: http://localhost:${PORT}
  API文档: http://localhost:${PORT}/api/student-contacts
  `);
});
