const mysql = require('mysql2/promise');

async function checkTableStructure() {
  const connection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'jxt_dev'
  });

  try {
    console.log('查询 tbl_jxt_student_contact 表结构...\n');

    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'jxt_dev'
        AND TABLE_NAME = 'tbl_jxt_student_contact'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('字段列表：');
    console.log('━'.repeat(80));
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE.padEnd(15)} ${col.COLUMN_TYPE}`);
    });
    console.log('━'.repeat(80));

    console.log('\n查询前5条数据：\n');
    const [rows] = await connection.query('SELECT * FROM tbl_jxt_student_contact LIMIT 5');

    if (rows.length > 0) {
      console.log(JSON.stringify(rows, null, 2));
    } else {
      console.log('表中暂无数据');
    }

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkTableStructure();
