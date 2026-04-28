/**
 * 纯Node.js数据库查询工具 - 无需任何依赖
 * 直接在命令行查询数据库
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev'
};

/**
 * 查询所有学生联系人
 */
async function queryAllContacts() {
  console.log('🔗 正在连接数据库...\n');

  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('✅ 连接成功！\n');
    console.log('📊 正在查询数据...\n');

    const [rows] = await connection.execute(`
      SELECT id, cellphone
      FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
    `);

    console.log(`✅ 查询成功！共 ${rows.length} 条记录\n`);
    console.log('━'.repeat(50));
    console.log('ID\t\t手机号');
    console.log('━'.repeat(50));

    rows.forEach(row => {
      console.log(`${row.id}\t\t${row.cellphone}`);
    });

    console.log('━'.repeat(50));
    console.log(`\n总计: ${rows.length} 条记录\n`);

    return rows;

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    throw error;

  } finally {
    await connection.end();
    console.log('🔌 数据库连接已关闭\n');
  }
}

/**
 * 根据ID查询
 */
async function queryById(id) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(`
      SELECT id, cellphone FROM tbl_jxt_student_contact WHERE id = ?
    `, [id]);

    if (rows.length > 0) {
      console.log(`✅ 找到记录: ID=${rows[0].id}, 手机号=${rows[0].cellphone}\n`);
      return rows[0];
    } else {
      console.log(`⚠️  未找到ID为 ${id} 的记录\n`);
      return null;
    }

  } finally {
    await connection.end();
  }
}

/**
 * 导出为JSON文件
 */
async function exportToJSON(filename = 'contacts.json') {
  const fs = require('fs');

  console.log('📦 正在导出数据...\n');

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(`
      SELECT id, cellphone
      FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
    `);

    fs.writeFileSync(filename, JSON.stringify(rows, null, 2), 'utf8');
    console.log(`✅ 数据已导出到 ${filename}\n`);
    console.log(`📊 共导出 ${rows.length} 条记录\n`);

    return rows;

  } finally {
    await connection.end();
  }
}

/**
 * 导出为CSV文件
 */
async function exportToCSV(filename = 'contacts.csv') {
  const fs = require('fs');

  console.log('📄 正在导出CSV...\n');

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(`
      SELECT id, cellphone
      FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
    `);

    const csvHeader = 'id,cellphone\n';
    const csvData = rows.map(row => `${row.id},${row.cellphone}`).join('\n');

    fs.writeFileSync(filename, csvHeader + csvData, 'utf8');
    console.log(`✅ CSV已导出到 ${filename}\n`);
    console.log(`📊 共导出 ${rows.length} 条记录\n`);

    return rows;

  } finally {
    await connection.end();
  }
}

// ==================== 命令行使用 ====================

// 获取命令行参数
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

async function main() {
  try {
    switch (command) {
      case 'all':
      case undefined:
        await queryAllContacts();
        break;

      case 'id':
        if (!param) {
          console.log('❌ 请提供ID参数: node direct-db-query.js id <ID>\n');
          return;
        }
        await queryById(param);
        break;

      case 'json':
        await exportToJSON(param || 'contacts.json');
        break;

      case 'csv':
        await exportToCSV(param || 'contacts.csv');
        break;

      default:
        console.log(`
📖 使用方法:

  node direct-db-query.js [命令] [参数]

🔧 命令:

  all              查询所有记录（默认）
  id <ID>          根据ID查询
  json [文件名]    导出为JSON文件（默认: contacts.json）
  csv [文件名]     导出为CSV文件（默认: contacts.csv）

📝 示例:

  node direct-db-query.js all
  node direct-db-query.js id 123
  node direct-db-query.js json export.json
  node direct-db-query.js csv contacts.csv
        `);
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  }
}

main();
