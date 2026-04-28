// 测试Web API
async function testWebAPI() {
  console.log('测试 Web API...\n');

  try {
    // 测试搜索 "蒲林芝"
    const response = await fetch('http://localhost:3000/api/students/search?name=蒲林芝');

    console.log(`HTTP状态码: ${response.status}`);

    if (!response.ok) {
      console.error(`请求失败: ${response.status}`);
      return;
    }

    const result = await response.json();

    console.log('\nAPI响应:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.data.length > 0) {
      console.log(`\n✅ 搜索成功！找到 ${result.data.length} 名学生`);
      result.data.forEach(student => {
        console.log(`  - ${student.student_name}: ${student.contacts.length} 位接送人`);
      });
    } else {
      console.log('\n⚠️ 未找到匹配的学生');
    }

  } catch (error) {
    console.error('错误:', error.message);
  }
}

testWebAPI();
