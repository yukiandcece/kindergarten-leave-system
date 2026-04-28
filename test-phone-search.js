// 测试电话号码搜索功能
async function testPhoneSearch() {
  const testCases = [
    { input: '13800000000', desc: '电话号码搜索' },
    { input: '蒲林芝', desc: '学生姓名搜索' },
    { input: '22222', desc: '短号码搜索' }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`测试: ${testCase.desc}`);
    console.log(`输入: "${testCase.input}"`);
    console.log('━'.repeat(60));

    try {
      const response = await fetch(`http://localhost:3000/api/students/search?name=${encodeURIComponent(testCase.input)}`);

      console.log(`状态码: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ 错误: ${errorText}`);
        continue;
      }

      const result = await response.json();

      if (result.success) {
        if (result.data.length > 0) {
          console.log(`✅ 找到 ${result.data.length} 名学生:`);
          result.data.forEach(student => {
            console.log(`  📚 学生: ${student.student_name} (ID: ${student.id})`);
            console.log(`     接送人: ${student.contacts.length} 位`);
            student.contacts.forEach((contact, idx) => {
              const roleMap = {1: '爸爸', 2: '妈妈', 3: '爷爷', 4: '奶奶', 5: '外公', 6: '外婆', 7: '其他'};
              console.log(`       ${idx + 1}. ${contact.parent_name} - ${roleMap[contact.relation]} - ${contact.cellphone}`);
            });
          });
        } else {
          console.log(`⚠️ 未找到匹配结果`);
          console.log(`   提示: ${result.message}`);
        }
      } else {
        console.log(`❌ 失败: ${result.message}`);
      }

    } catch (error) {
      console.log(`❌ 异常: ${error.message}`);
    }

    // 延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));
}

testPhoneSearch();
