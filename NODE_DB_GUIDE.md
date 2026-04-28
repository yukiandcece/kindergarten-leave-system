# Node.js 直接连接数据库 - 最简单方案

## ✅ 可以！用 Node.js 直接连接数据库

### 为什么浏览器不能，但 Node.js 可以？

| 环境 | 能否直连MySQL | 原因 |
|------|--------------|------|
| **浏览器JavaScript** | ❌ 不能 | 安全限制，不支持TCP socket |
| **Node.js** | ✅ 可以 | 运行在服务器端，支持TCP连接 |

---

## 🚀 方案1: 纯 Node.js（零依赖）

只需安装 mysql2，直接在命令行查询数据库。

### 安装依赖
```bash
npm install mysql2
```

### 查询所有记录
```bash
node direct-db-query.js all
```

### 根据ID查询
```bash
node direct-db-query.js id 123
```

### 导出为JSON
```bash
node direct-db-query.js json contacts.json
```

### 导出为CSV
```bash
node direct-db-query.js csv contacts.csv
```

---

## 🌐 方案2: Node.js + HTTP服务器（推荐）

启动一个Node.js服务器，提供网页和API接口。

### 安装依赖
```bash
npm install mysql2
```

### 启动服务器
```bash
node leave-detail-node.js
```

### 访问页面
```
浏览器打开: http://localhost:3000
API接口:    http://localhost:3000/api/contacts
```

### 前端调用
```javascript
// 在网页中直接调用
fetch('/api/contacts')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📦 完整示例代码

### 查询数据库（直接使用）
```javascript
const mysql = require('mysql2/promise');

async function queryDatabase() {
  const connection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'jxt_dev'
  });

  try {
    const [rows] = await connection.execute(`
      SELECT id, cellphone FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
    `);

    console.log('查询结果:', rows);
    return rows;

  } finally {
    await connection.end();
  }
}

// 执行查询
queryDatabase();
```

---

## 🎯 推荐方案对比

| 方案 | 优点 | 适用场景 |
|------|------|---------|
| **命令行查询** | 最简单，直接看到结果 | 快速查询、导出数据 |
| **HTTP服务器** | 提供网页+API | 完整的Web应用 |
| **集成到现有代码** | 无需额外服务 | 在现有脚本中使用 |

---

## 💡 快速开始

### 方式1: 命令行查询（最快）

```bash
# 1. 安装依赖
npm install mysql2

# 2. 查询数据
node direct-db-query.js all
```

### 方式2: 启动Web服务器

```bash
# 1. 安装依赖
npm install mysql2

# 2. 启动服务器
node leave-detail-node.js

# 3. 浏览器访问
# http://localhost:3000
```

### 方式3: 在代码中直接使用

```javascript
// 直接在您的JavaScript文件中使用
const mysql = require('mysql2/promise');

async function getContacts() {
  const connection = await mysql.createConnection({
    host: '47.97.213.134',
    port: 3306,
    user: 'baicy',
    password: 'baicy123',
    database: 'jxt_dev'
  });

  const [rows] = await connection.execute(
    'SELECT id, cellphone FROM tbl_jxt_student_contact'
  );

  await connection.end();
  return rows;
}
```

---

## ✅ 总结

**是的！Node.js 可以直接连接数据库！**

- ✅ 不需要额外的API框架
- ✅ 只需 `mysql2` 一个依赖
- ✅ 代码简单，易于理解
- ✅ 可以命令行直接查询
- ✅ 也可以提供Web服务

需要我帮您执行查询吗？
