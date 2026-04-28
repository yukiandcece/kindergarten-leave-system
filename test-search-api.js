const mysql = require('mysql2/promise');

async function testSearch() {
  const ucenterConnection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'ucenter_dev',
    charset: 'utf8mb4'
  });

  const jxtConnection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'jxt_dev',
    charset: 'utf8mb4'
  });

  try {
    console.log('测试搜索学生姓名: "张"\n');

    // 查询学生信息
    const [students] = await ucenterConnection.execute(`
      SELECT id, student_name
      FROM tbl_ucenter_student
      WHERE student_name LIKE ?
      ORDER BY id
      LIMIT 5
    `, ['%张%']);

    console.log(`找到 ${students.length} 名学生:`);
    students.forEach(s => {
      console.log(`  - ID: ${s.id}, 姓名: ${s.student_name}`);
    });

    if (students.length === 0) {
      console.log('\n未找到学生，尝试查询所有学生...');
      const [allStudents] = await ucenterConnection.execute(`
        SELECT id, student_name
        FROM tbl_ucenter_student
        ORDER BY id
        LIMIT 5
      `);
      console.log(`\n数据库中的前5名学生:`);
      allStudents.forEach(s => {
        console.log(`  - ID: ${s.id}, 姓名: ${s.student_name}`);
      });
      return;
    }

    // 获取学生ID列表
    const studentIds = students.map(s => s.id);

    // 查询接送人信息
    const placeholders = studentIds.map(() => '?').join(',');
    const [contacts] = await jxtConnection.execute(`
      SELECT student_id, parent_name, cellphone, parent_role
      FROM tbl_jxt_student_contact
      WHERE student_id IN (${placeholders})
        AND valid_status = 1
        AND parent_name IS NOT NULL
        AND parent_name != ''
      ORDER BY student_id, parent_role
    `, studentIds);

    console.log(`\n找到 ${contacts.length} 位接送人:`);
    contacts.forEach(c => {
      const roleMap = {1: '爸爸', 2: '妈妈', 3: '爷爷', 4: '奶奶', 5: '外公', 6: '外婆', 7: '其他'};
      console.log(`  - 学生ID: ${c.student_id}, 接送人: ${c.parent_name}, 电话: ${c.cellphone}, 关系: ${roleMap[c.parent_role] || '其他'}`);
    });

    // 组装数据
    console.log('\n最终数据结构:');
    const result = students.map(student => {
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

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await ucenterConnection.end();
    await jxtConnection.end();
  }
}

testSearch();
