// 直接测试API
async function testAPI() {
  const testNames = ['蒲林芝', '张', '陈'];

  for (const name of testNames) {
    console.log(`\n测试搜索: "${name}"`);
    console.log('━'.repeat(60));

    try {
      const response = await fetch(`http://localhost:3000/api/students/search?name=${encodeURIComponent(name)}`);

      console.log(`状态码: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`错误响应: ${errorText}`);
        continue;
      }

      const result = await response.json();

      if (result.success) {
        if (result.data.length > 0) {
          console.log(`✅ 找到 ${result.data.length} 名学生:`);
          result.data.forEach(student => {
            console.log(`  - ${student.student_name} (${student.contacts.length} 位接送人)`);
          });
        } else {
          console.log('⚠️ 未找到匹配的学生');
        }
      } else {
        console.log(`❌ 失败: ${result.message}`);
      }

    } catch (error) {
      console.log(`❌ 异常: ${error.message}`);
    }
  }
}

testAPI();
