# 数据库查询完整指南

## 📦 数据库连接配置

### 连接信息
```yaml
主机地址: 47.97.213.134
端口: 3306
用户名: baicy
密码: baicy123
字符集: utf8mb4
```

### Node.js 连接配置
```javascript
const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  charset: 'utf8mb4'
};
```

---

## 🗄️ 数据库表结构

### 数据库1：`ucenter_dev`

#### 表：`tbl_ucenter_student`（学生信息表）

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `id` | INT | 学生ID（主键） | 1001 |
| `student_name` | VARCHAR | 学生姓名 | "张小明" |

**SQL建表语句**：
```sql
CREATE TABLE tbl_ucenter_student (
  id INT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**查询示例**：
```sql
-- 查询所有学生
SELECT id, student_name FROM tbl_ucenter_student;

-- 模糊搜索学生姓名
SELECT id, student_name
FROM tbl_ucenter_student
WHERE student_name LIKE '%张%';
```

---

### 数据库2：`jxt_dev`

#### 表：`tbl_jxt_student_contact`（学生联系人表）

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `id` | INT | 联系人ID（与学生表id关联） | 1001 |
| `parent_name` | VARCHAR | 接送人姓名 | "张建国" |
| `cellphone` | VARCHAR | 手机号码 | "13800138000" |
| `relation` | INT | 关系代码 | 1 |

**关系代码说明**：
```
1 = 爸爸
2 = 妈妈
3 = 爷爷
4 = 奶奶
5 = 外公
6 = 外婆
7 = 其他
```

**SQL建表语句**：
```sql
CREATE TABLE tbl_jxt_student_contact (
  id INT,
  parent_name VARCHAR(100) NOT NULL,
  cellphone VARCHAR(20),
  relation INT,
  PRIMARY KEY (id, relation),
  FOREIGN KEY (id) REFERENCES tbl_ucenter_student(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**查询示例**：
```sql
-- 查询所有联系人
SELECT id, parent_name, cellphone, relation
FROM tbl_jxt_student_contact;

-- 查询特定学生的联系人
SELECT id, parent_name, cellphone, relation
FROM tbl_jxt_student_contact
WHERE id = 1001;
```

---

## 🔍 关联查询（核心功能）

### 需求说明
根据学生姓名模糊搜索，返回学生及其所有接送人信息。

### SQL查询语句

#### 方式1：LEFT JOIN（推荐）

```sql
SELECT
  s.id AS student_id,
  s.student_name,
  c.parent_name,
  c.cellphone,
  c.relation
FROM ucenter_dev.tbl_ucenter_student s
LEFT JOIN jxt_dev.tbl_jxt_student_contact c
  ON s.id = c.id
WHERE s.student_name LIKE '%张%'
  AND c.parent_name IS NOT NULL
ORDER BY s.id, c.relation;
```

**查询结果示例**：
```
student_id | student_name | parent_name | cellphone    | relation
-----------|--------------|-------------|--------------|----------
1001       | 张小明       | 张建国      | 13800138000  | 1
1001       | 张小明       | 李美华      | 13800138001  | 2
1001       | 张小明       | 张国强      | 13800138002  | 3
1002       | 张小红       | 王东升      | 13900139000  | 1
```

#### 方式2：分步查询

**步骤1：查询学生信息**
```sql
SELECT id, student_name
FROM ucenter_dev.tbl_ucenter_student
WHERE student_name LIKE '%张%';
```

**步骤2：查询联系人信息**
```sql
SELECT id, parent_name, cellphone, relation
FROM jxt_dev.tbl_jxt_student_contact
WHERE id IN (1001, 1002, 1003);
```

**步骤3：在应用层关联数据**

---

## 🔧 Node.js 实现

### 完整查询函数

```javascript
const mysql = require('mysql2/promise');

/**
 * 根据学生姓名搜索学生及接送人信息
 * @param {string} searchName - 搜索的学生姓名
 * @returns {Promise<Array>} 学生及接送人信息数组
 */
async function searchStudentsByName(searchName) {
  // 创建两个数据库连接
  const ucenterConnection = await mysql.createConnection({
    ...dbConfig,
    database: 'ucenter_dev'
  });

  const jxtConnection = await mysql.createConnection({
    ...dbConfig,
    database: 'jxt_dev'
  });

  try {
    // 1. 查询学生信息
    const [students] = await ucenterConnection.execute(`
      SELECT id, student_name
      FROM tbl_ucenter_student
      WHERE student_name LIKE ?
      ORDER BY id
    `, [`%${searchName}%`]);

    if (students.length === 0) {
      return [];
    }

    // 2. 获取学生ID列表
    const studentIds = students.map(s => s.id);

    // 3. 查询联系人信息
    const placeholders = studentIds.map(() => '?').join(',');
    const [contacts] = await jxtConnection.execute(`
      SELECT id, parent_name, cellphone, relation
      FROM tbl_jxt_student_contact
      WHERE id IN (${placeholders})
      ORDER BY id, relation
    `, studentIds);

    // 4. 组装数据
    const result = students.map(student => {
      const studentContacts = contacts.filter(c => c.id === student.id);
      return {
        id: student.id,
        student_name: student.student_name,
        contacts: studentContacts.map(c => ({
          parent_name: c.parent_name,
          cellphone: c.cellphone,
          relation: c.relation
        }))
      };
    });

    return result;

  } finally {
    // 关闭连接
    await ucenterConnection.end();
    await jxtConnection.end();
  }
}
```

### 关系字段转换

```javascript
/**
 * 将关系代码转换为中文
 * @param {number} relationCode - 关系代码（1-7）
 * @returns {string} 中文关系名称
 */
function convertRelationCode(relationCode) {
  const relationMap = {
    1: '爸爸',
    2: '妈妈',
    3: '爷爷',
    4: '奶奶',
    5: '外公',
    6: '外婆',
    7: '其他'
  };

  return relationMap[relationCode] || '其他';
}

// 使用示例
console.log(convertRelationCode(1)); // 输出: "爸爸"
console.log(convertRelationCode(7)); // 输出: "其他"
console.log(convertRelationCode(99)); // 输出: "其他"（未知代码）
```

---

## 🌐 API 接口规范

### 接口定义

#### 请求
```
GET /api/students/search?name=张
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 学生姓名（支持模糊搜索） |

#### 响应格式

**成功响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "student_name": "张小明",
      "contacts": [
        {
          "parent_name": "张建国",
          "cellphone": "13800138000",
          "relation": 1
        },
        {
          "parent_name": "李美华",
          "cellphone": "13800138001",
          "relation": 2
        }
      ]
    }
  ]
}
```

**无结果响应**：
```json
{
  "success": true,
  "message": "未找到匹配的学生",
  "data": []
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

---

## 🔒 安全注意事项

### 1. 只读查询
✅ **只执行SELECT操作**
❌ 不执行INSERT/UPDATE/DELETE

### 2. SQL注入防护
✅ **使用参数化查询**
```javascript
// 正确 ✅
const [rows] = await connection.execute(
  'SELECT * FROM tbl WHERE name LIKE ?',
  [`%${searchName}%`]
);

// 错误 ❌
const sql = `SELECT * FROM tbl WHERE name LIKE '%${searchName}%'`;
```

### 3. 连接管理
✅ **及时关闭连接**
```javascript
try {
  // 查询操作
} finally {
  await connection.end();
}
```

### 4. 输入验证
✅ **验证搜索关键词**
```javascript
if (!searchName || searchName.trim().length === 0) {
  return { error: '请输入搜索关键词' };
}

if (searchName.length > 50) {
  return { error: '搜索关键词过长' };
}
```

### 5. 错误处理
✅ **捕获并记录异常**
```javascript
try {
  const result = await searchStudentsByName(name);
  return result;
} catch (error) {
  console.error('数据库查询错误:', error);
  throw new Error('查询失败，请稍后重试');
}
```

### 6. 密码保护
❌ **不在前端代码中暴露密码**
✅ **只在服务器端存储密码**

---

## 📊 数据流程图

```
┌─────────────┐
│ 用户输入     │
│ "张"        │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ 前端发起请求     │
│ GET /api/students│
│ /search?name=张 │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Node.js API     │
│ 服务器          │
└──────┬──────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ ucenter_dev  │  │ jxt_dev      │
│ 数据库       │  │ 数据库       │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ 查询学生信息     │ 查询联系人
       │                 │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ 组装JSON数据     │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ 返回给前端       │
       └─────────────────┘
```

---

## 🧪 测试用例

### 测试用例1：正常搜索
```javascript
// 输入
await searchStudentsByName("张");

// 预期输出
[
  {
    id: 1001,
    student_name: "张小明",
    contacts: [
      { parent_name: "张建国", cellphone: "13800138000", relation: 1 },
      { parent_name: "李美华", cellphone: "13800138001", relation: 2 }
    ]
  }
]
```

### 测试用例2：无结果搜索
```javascript
// 输入
await searchStudentsByName("不存在xyz");

// 预期输出
[]
```

### 测试用例3：特殊字符搜索
```javascript
// 输入
await searchStudentsByName("张%' OR '1'='1");

// 预期：安全处理，无SQL注入
```

---

## 📝 完整API服务器实现

详见 `simple-server.js` 文件，包含：
- ✅ `/api/students/search` 接口
- ✅ 参数化查询
- ✅ 错误处理
- ✅ 连接管理
- ✅ CORS支持

---

## 🚀 使用示例

### 1. 直接使用查询函数
```javascript
const students = await searchStudentsByName("张");
console.log(`找到 ${students.length} 名学生`);
```

### 2. 在Express路由中使用
```javascript
app.get('/api/students/search', async (req, res) => {
  try {
    const name = req.query.name;
    const result = await searchStudentsByName(name);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### 3. 前端调用
```javascript
const response = await fetch('/api/students/search?name=张');
const result = await response.json();
console.log(result.data);
```

---

## ✅ 检查清单

实施前检查：
- [ ] 数据库连接信息正确
- [ ] 表结构已确认
- [ ] SQL查询已测试
- [ ] 安全措施已就绪

实施后验证：
- [ ] API接口正常工作
- [ ] 搜索结果正确
- [ ] 关系字段正确转换
- [ ] 错误提示友好
- [ ] 无SQL注入风险
- [ ] 数据库连接及时关闭

---

**文档版本**: 1.0
**最后更新**: 2026-04-27
**维护者**: Claude Code
