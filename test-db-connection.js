const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('测试数据库连接...\n');

  const config = {
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'ucenter_dev',
    connectTimeout: 5000 // 5秒超时
  };

  console.log(`尝试连接到: ${config.host}:${config.port}`);
  console.log(`用户: ${config.user}`);
  console.log(`数据库: ${config.database}\n`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功！');

    // 测试查询
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM tbl_ucenter_student WHERE student_status = 1');
    console.log(`✅ 查询成功！可用学生数量: ${rows[0].count}`);

    await connection.end();
    console.log('\n✅ 数据库连接正常！');

  } catch (error) {
    console.error('\n❌ 数据库连接失败！');
    console.error('错误代码:', error.code);
    console.error('错误信息:', error.message);

    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 可能的原因:');
      console.log('1. 数据库服务器无法访问（网络问题）');
      console.log('2. 防火墙阻止了连接');
      console.log('3. 数据库服务未启动');
      console.log('4. IP地址或端口错误');
      console.log('\n💡 建议解决方案:');
      console.log('1. 检查网络连接');
      console.log('2. ping 47.97.213.134 测试连通性');
      console.log('3. 联系数据库管理员检查服务器状态');
    }
  }
}

testConnection();
