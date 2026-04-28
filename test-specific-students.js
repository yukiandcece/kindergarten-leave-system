const mysql = require('mysql2/promise');

async function testSpecificStudents() {
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
    // 测试已知有接送人数据的学生ID
    const studentIds = [26976, 26977, 26981];

    console.log(`测试学生ID: ${studentIds.join(', ')}\n`);

    // 查询学生信息
    const placeholders = studentIds.map(() => '?').join(',');
    const [students] = await ucenterConnection.execute(`
      SELECT id, student_name
      FROM tbl_ucenter_student
      WHERE id IN (${placeholders})
    `, studentIds);

    console.log('学生信息:');
    students.forEach(s => {
      console.log(`  - ID: ${s.id}, 姓名: ${s.student_name}`);
    });

    // 查询接送人信息
    const [contacts] = await jxtConnection.execute(`
      SELECT student_id, parent_name, cellphone, parent_role
      FROM tbl_jxt_student_contact
      WHERE student_id IN (${placeholders})
        AND valid_status = 1
        AND parent_name IS NOT NULL
        AND parent_name != ''
      ORDER BY student_id, parent_role
    `, studentIds);

    console.log(`\n接送人信息 (${contacts.length} 条):`);
    const roleMap = {1: '爸爸', 2: '妈妈', 3: '爷爷', 4: '奶奶', 5: '外公', 6: '外婆', 7: '其他'};
    contacts.forEach(c => {
      console.log(`  - 学生ID: ${c.student_id}, 接送人: ${c.parent_name}, 电话: ${c.cellphone}, 关系: ${roleMap[c.parent_role]}`);
    });

    // 组装数据
    console.log('\n最终数据:');
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

testSpecificStudents();
