# 后端API服务使用指南

## 📦 安装依赖

```bash
# 安装npm依赖包
npm install express mysql2 cors

# 或者使用提供的package.json
npm install
```

## 🚀 启动API服务

```bash
# 启动服务
node api-server.js

# 或者使用npm脚本
npm start

# 开发模式（自动重启）
npm run dev
```

服务启动后，API运行在：**http://localhost:3001**

## 📡 API接口

### 1. 查询学生联系人列表

**请求：**
```
GET /api/student-contacts?page=1&pageSize=100
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "cellphone": "13800138000"
    },
    {
      "id": 2,
      "cellphone": "13900139000"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 100,
    "total": 250,
    "totalPages": 3
  }
}
```

### 2. 根据ID查询单个联系人

**请求：**
```
GET /api/student-contacts/1
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cellphone": "13800138000"
  }
}
```

### 3. 健康检查

**请求：**
```
GET /api/health
```

**响应示例：**
```json
{
  "success": true,
  "message": "API服务正常运行",
  "timestamp": "2026-04-27T10:30:00.000Z"
}
```

## 💻 前端调用示例

### 在HTML页面中使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>查询学生联系人</title>
</head>
<body>
  <button onclick="loadData()">查询数据</button>
  <table id="contactTable">
    <thead>
      <tr>
        <th>ID</th>
        <th>手机号</th>
      </tr>
    </thead>
    <tbody id="contactTableBody"></tbody>
  </table>

  <script src="api-client.js"></script>
  <script>
    async function loadData() {
      try {
        const result = await getStudentContacts(1, 20);
        const tbody = document.getElementById('contactTableBody');

        tbody.innerHTML = result.data.map(row => `
          <tr>
            <td>${row.id}</td>
            <td>${row.cellphone}</td>
          </tr>
        `).join('');

        console.log(`查询成功: 共 ${result.pagination.total} 条记录`);
      } catch (error) {
        alert('查询失败: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

### 在现有项目中使用

在您的离园系统页面中添加：

```javascript
// 在 leave-detail.js 中添加

/**
 * 从数据库查询学生联系人手机号
 */
async function queryContactPhoneFromDB(studentId) {
  try {
    const result = await fetch(`http://localhost:3001/api/student-contacts/${studentId}`);
    const data = await result.json();

    if (data.success) {
      return data.data.cellphone;
    } else {
      console.error('查询失败:', data.message);
      return null;
    }
  } catch (error) {
    console.error('请求失败:', error);
    return null;
  }
}

// 使用示例：在拨打电话前查询真实手机号
async function handleCallPhone() {
  const candidate = selectedCandidateData;
  if (!candidate) return;

  // 从数据库查询手机号（如果需要）
  // const phone = await queryContactPhoneFromDB(candidate.id);

  // 确认拨打电话
  if (confirm(`确定要拨打 ${candidate.parent}（${candidate.relation}）的电话吗？`)) {
    window.location.href = `tel:${candidate.phone}`;
    addAbnormal(`已拨打 ${candidate.parent}（${candidate.relation}）电话：${candidate.phone}`, currentChild);
  }
}
```

## 🔒 安全特性

✅ **只读查询**：仅执行SELECT操作，不修改数据
✅ **参数化查询**：防止SQL注入
✅ **CORS支持**：允许前端跨域访问
✅ **连接池**：高效的数据库连接管理
✅ **错误处理**：完善的异常捕获和响应

## 🛠️ 自定义配置

如需修改API端口或数据库配置，编辑 `api-server.js`：

```javascript
const PORT = 3001; // 修改API服务端口

const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev'
};
```

## 📝 注意事项

1. **先启动API服务**：确保 `node api-server.js` 正在运行
2. **端口可用**：确认3001端口未被占用
3. **数据库连接**：确保能访问到数据库服务器
4. **只读操作**：当前API仅支持查询，不支持增删改
