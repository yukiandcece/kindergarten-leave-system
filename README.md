# 🏫 幼儿园离园考勤管理系统

现代化的幼儿园离园考勤管理系统，提供专业、安全、高效的离园管理解决方案。

## ✨ 特性

- 🎨 **现代化UI设计** - 采用青绿色系主题，清新专业
- 📱 **响应式布局** - 完美适配桌面、平板、手机等各种设备
- 🔐 **多重验证** - 手机号验证码 + NFC刷卡双重验证
- 👤 **人脸识别** - 接送人人脸照片确认，确保安全
- 📊 **数据管理** - 完整的离园记录和异常处理机制
- ⚡ **即时反馈** - Toast通知系统，操作反馈清晰及时
- 🎯 **模块化架构** - 代码结构清晰，易于维护和扩展
- 📡 **NFC技术** - 采用先进的NFC近场通信技术

## 🚀 快速开始

### 环境要求

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 本地开发服务器（推荐使用 live-server）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/kindergarten-leave-system.git
cd kindergarten-leave-system
```

2. **安装依赖**（可选）
```bash
npm install
```

3. **启动开发服务器**
```bash
# 使用 npm 脚本
npm run dev

# 或直接使用 live-server
npx live-server --port=8080
```

4. **访问应用**
打开浏览器访问 `http://localhost:8080`

## 📁 项目结构

```
kindergarten-leave-system/
├── src/                          # 源代码目录
│   ├── assets/                   # 静态资源
│   │   └── hero-fill.png         # 主页图片
│   ├── styles/                   # 样式文件
│   │   ├── variables.css         # CSS变量
│   │   ├── base.css              # 基础样式
│   │   ├── components.css        # 组件样式
│   │   ├── icons.css             # 图标样式
│   │   ├── toast.css             # Toast通知样式
│   │   └── modal.css             # 模态框样式
│   └── scripts/                  # JavaScript文件
│       ├── modules/              # 功能模块
│       │   ├── login.js          # 登录模块
│       │   └── leaveDetail.js    # 离园详情模块
│       └── utils/                # 工具函数
│           ├── icons.js          # 图标管理
│           ├── toast.js          # Toast通知
│           ├── modal.js          # 模态框
│           ├── validators.js     # 表单验证
│           └── helpers.js        # 辅助函数
├── index.html                    # 登录页面
├── leave-detail.html            # 离园详情页面
├── styles.css                    # 主样式文件（向后兼容）
├── main.js                       # 主脚本（向后兼容）
├── leave-detail.js              # 详情页脚本（向后兼容）
├── package.json                 # 项目配置
├── .gitignore                   # Git忽略文件
└── README.md                    # 项目文档
```

## 🎯 功能模块

### 1. 登录系统
- ✅ 手机号验证（11位数字）
- ✅ 验证码登录（4位数字）
- ✅ 多终端选择（入园考勤拍摄端、确认端、离园确认端）
- ✅ 60秒倒计时防重复发送

### 2. 离园考勤
- ✅ NFC刷卡识别
- ✅ 接送人人脸确认
- ✅ 关系验证（爸爸、妈妈、爷爷、奶奶等）
- ✅ 离园记录管理
- ✅ 分页查询功能
- ✅ 支持实体NFC卡和手机NFC功能

### 3. 异常处理
- ✅ 无授权关系备注
- ✅ 紧急联系人通知
- ✅ 异常记录追踪

### 4. 数据管理
- ✅ 本地存储支持
- ✅ 表单数据验证
- ✅ 输入格式限制
- ✅ 错误提示系统

## 🛠️ 技术栈

- **前端框架**: 原生 JavaScript (ES6+)
- **样式系统**: CSS3 + CSS变量
- **图标系统**: SVG图标
- **开发工具**: ESLint, Prettier
- **版本控制**: Git

## 📝 开发规范

### 代码风格
- 使用 ES6+ 语法
- 遵循模块化开发原则
- 添加详细的代码注释
- 使用语义化的命名

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链更新
```

## 🔧 配置说明

### 环境变量
创建 `.env` 文件配置环境变量：
```env
API_BASE_URL=http://your-api.com
TIMEOUT=5000
```

### 浏览器兼容性
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 📱 响应式断点

- 手机: < 768px
- 平板: 768px - 1024px
- 桌面: > 1024px

## 🎨 设计规范

### 颜色系统
- 主色调: `#00d7a8` (青绿色)
- 辅助色: `#2f63a2` (蓝色)
- 成功色: `#1a9c5e`
- 警告色: `#cc8a00`
- 错误色: `#eb4335`

### 字体规范
- 基础字号: 16px
- 行高: 1.4-1.6
- 字重: 400/500/600/700

## 🔐 安全特性

- XSS 防护（HTML转义）
- 输入验证和过滤
- CSRF 保护（预留接口）
- 敏感信息加密存储

## 🚢 部署说明

### 构建生产版本
```bash
npm run build
```

### 部署到服务器
1. 构建项目
2. 将 `dist/` 目录上传到服务器
3. 配置 Nginx/Apache

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 致谢

- 感谢所有贡献者
- 感谢开源社区的宝贵建议

## 📮 联系方式

- 项目主页: [https://github.com/yourusername/kindergarten-leave-system](https://github.com/yourusername/kindergarten-leave-system)
- 问题反馈: [Issues](https://github.com/yourusername/kindergarten-leave-system/issues)
- 邮箱: your.email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！