const mysql = require('mysql2/promise');

async function testStatusFilter() {
  const connection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'ucenter_dev',
    charset: 'utf8mb4'
  });

  try {
    console.log('测试学生状态过滤功能\n');

    // 查询所有学生的状态分布
    const [statusCounts] = await connection.execute(`
      SELECT student_status, COUNT(*) as count
      FROM tbl_ucenter_student
      GROUP BY student_status
    `);

    console.log('学生状态分布:');
    const statusMap = {1: '可用', 2: '已删除'};
    statusCounts.forEach(row => {
      console.log(`  - ${statusMap[row.student_status] || row.student_status}: ${row.count} 人`);
    });

    // 测试过滤可用学生
    console.log('\n查询可用的学生（student_status = 1）:');
    const [activeStudents] = await connection.execute(`
      SELECT id, student_name, student_status
      FROM tbl_ucenter_student
      WHERE student_status = 1
      LIMIT 5
    `);

    console.log(`找到 ${activeStudents.length} 名可用学生:`);
    activeStudents.forEach(s => {
      console.log(`  - ID: ${s.id}, 姓名: ${s.student_name}, 状态: ${s.student_status}`);
    });

    // 对比：查询已删除的学生
    console.log('\n查询已删除的学生（student_status = 2）:');
    const [deletedStudents] = await connection.execute(`
      SELECT id, student_name, student_status
      FROM tbl_ucenter_student
      WHERE student_status = 2
      LIMIT 5
    `);

    console.log(`找到 ${deletedStudents.length} 名已删除学生:`);
    deletedStudents.forEach(s => {
      console.log(`  - ID: ${s.id}, 姓名: ${s.student_name}, 状态: ${s.student_status}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await connection.end();
  }
}

testStatusFilter();
