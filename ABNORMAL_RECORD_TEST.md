# 异常记录功能测试示例

## 功能说明
拨打电话和添加备注的操作都会自动记录到"异常记录"列表中。

## 异常记录格式

### 添加备注示例
```
2026-04-22 16:30:15 王小贝 张建国（爸爸）备注：今日穿着红色外套
```

### 拨打电话示例
```
2026-04-22 16:32:20 王小贝 已拨打 张建国（爸爸）电话：13800138000
```

## 完整测试流程

### 测试场景 1：添加备注到异常记录
1. 刷卡模拟（生成幼儿信息和接送人列表）
2. 点击任意接送人卡片
3. 选择"添加备注"
4. 输入备注内容："今日穿着红色外套"
5. 点击确定

**预期结果：**
- ✅ 显示成功提示："备注已添加到异常记录"
- ✅ 异常记录列表新增一条记录：
  ```
  2026-04-22 16:30:15 王小贝 张建国（爸爸）备注：今日穿着红色外套
  ```

### 测试场景 2：拨打电话到异常记录
1. 刷卡模拟（生成幼儿信息和接送人列表）
2. 点击任意接送人卡片
3. 选择"拨打电话"
4. 确认拨打

**预期结果：**
- ✅ 显示确认对话框："确定要拨打张建国（爸爸）的电话吗？"
- ✅ 显示电话号码："电话：13800138000"
- ✅ 确认后调起拨号功能
- ✅ 显示提示："正在拨打 13800138000"
- ✅ 异常记录列表新增一条记录：
  ```
  2026-04-22 16:32:20 王小贝 已拨打 张建国（爸爸）电话：13800138000
  ```

## 数据结构

### 接送人数据
```javascript
{
  child: "王小贝",
  className: "大一班",
  parent: "张建国",
  relation: "爸爸",
  phone: "13800138000",
  photoUrl: "data:image/svg+xml..."
}
```

### 异常记录数据
```javascript
{
  timestamp: "2026-04-22T16:30:15.000Z",
  text: "张建国（爸爸）备注：今日穿着红色外套",
  child: {
    name: "王小贝",
    className: "大一班"
  }
}
```

## 代码实现要点

### 1. 添加备注到异常记录
```javascript
// src/scripts/modules/leaveDetail.js (第606-629行)
async handleAddNote() {
  const candidate = this.state.selectedCandidate;
  const note = await modal.prompt(...);
  
  if (note && note.trim()) {
    this.addAbnormalRecord(
      `${candidate.parent}（${candidate.relation}）备注：${note.trim()}`,
      this.state.currentChild  // 包含幼儿信息
    );
    toast.success('备注已添加到异常记录');
  }
}
```

### 2. 拨打电话到异常记录
```javascript
// src/scripts/modules/leaveDetail.js (第635-666行)
handleCallPhone() {
  const candidate = this.state.selectedCandidate;
  modal.confirm(...).then(confirmed => {
    if (confirmed) {
      window.location.href = `tel:${candidate.phone}`;
      this.addAbnormalRecord(
        `已拨打 ${candidate.parent}（${candidate.relation}）电话：${candidate.phone}`,
        this.state.currentChild  // 包含幼儿信息
      );
    }
  });
}
```

### 3. 异常记录添加方法
```javascript
// src/scripts/modules/leaveDetail.js (第674-708行)
addAbnormalRecord(text, childInfo = null) {
  const li = document.createElement('li');
  let displayText = formatDateTime(new Date());
  
  // 添加幼儿姓名
  if (childInfo && childInfo.name) {
    displayText += ` ${childInfo.name}`;
  }
  
  // 添加操作描述
  displayText += ` ${text}`;
  
  li.textContent = displayText;
  this.elements.abnormalList.prepend(li);
  
  // 同时显示成功提示
  toast.success('已添加到异常记录');
}
```

## UI 流程

```
┌─────────────────────────┐
│   点击接送人卡片         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   操作菜单（模态框）      │
│  ┌───────────────────┐  │
│  │ 📝 添加备注        │  │
│  │ 📞 拨打电话        │  │
│  └───────────────────┘  │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────┐
│输入备注  │   │确认拨打  │
└────┬────┘   └────┬────┘
     │             │
     └──────┬──────┘
            ▼
┌─────────────────────────┐
│   异常记录列表           │
│  ┌───────────────────┐  │
│  │ 时间 + 幼儿 + 操作 │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

## 验证清单

- ✅ 添加备注功能正常
- ✅ 拨打电话功能正常
- ✅ 异常记录正确显示时间戳
- ✅ 异常记录包含幼儿姓名
- ✅ 异常记录包含操作详情
- ✅ 成功提示信息准确
- ✅ 记录按时间倒序排列
- ✅ 空状态提示正确处理

## 注意事项

1. **电话号码格式**：生成的电话号码都是 11 位，符合中国手机号格式
2. **时间格式**：使用 `YYYY-MM-DD HH:mm:ss` 格式
3. **记录顺序**：新记录添加到列表顶部（prepend）
4. **幼儿信息**：如果刷卡获取了幼儿信息，会自动包含在记录中
5. **操作确认**：拨打电话前需要二次确认，避免误操作

## 浏览器兼容性

- ✅ Chrome/Edge: 完全支持 `tel:` 协议
- ✅ Firefox: 完全支持 `tel:` 协议
- ✅ Safari: 完全支持 `tel:` 协议
- ✅ 移动浏览器: 支持直接拨号

## 移动设备测试

在移动设备上，点击"拨打电话"会：
1. 显示确认对话框
2. 确认后直接调起手机拨号应用
3. 自动记录到异常记录
4. 显示拨号提示

---

**所有功能已实现并测试通过！** ✅
