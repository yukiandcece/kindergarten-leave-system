# 设计系统文档 (Design System)

## 📋 概述

本设计系统为"家园智慧驿站"应用提供统一的设计语言和组件规范。

---

## 🎨 设计令牌 (Design Tokens)

### 颜色系统

#### 主色调
```css
--color-primary: #00d7a8          /* 主绿色 */
--color-primary-hover: #00c695    /* 悬停状态 */
--color-primary-light: #ecfff8    /* 浅色背景 */
--color-primary-dark: #00b085     /* 深色状态 */
```

#### 文字颜色
```css
--color-text-primary: #18253a     /* 主要文字 */
--color-text-secondary: #5a6f85   /* 次要文字 */
--color-text-tertiary: #6a7f95    /* 辅助文字 */
--color-text-disabled: #cccccc    /* 禁用状态 */
```

#### 语义颜色
```css
--color-error: #eb4335            /* 错误 */
--color-warning: #cc8a00          /* 警告 */
--color-success: #00d7a8          /* 成功 */
--color-info: #2f63a2             /* 信息 */
```

### 字体系统

#### 字体大小（模块化比例 1.25）
```css
--font-size-xs: 12px              /* 超小文字 */
--font-size-sm: 14px              /* 小文字 */
--font-size-base: 16px            /* 基础文字 */
--font-size-lg: 20px              /* 大文字 */
--font-size-xl: 25px              /* 超大文字 */
--font-size-2xl: 31px             /* 标题小 */
--font-size-3xl: 39px             /* 标题中 */
--font-size-4xl: 48px             /* 标题大 */
--font-size-5xl: 56px             /* 超大标题 */
```

#### 行高
```css
--line-height-tight: 1.2          /* 紧凑 */
--line-height-normal: 1.5         /* 正常 */
--line-height-relaxed: 1.7        /* 宽松 */
```

#### 字重
```css
--font-weight-normal: 400         /* 常规 */
--font-weight-medium: 500         /* 中等 */
--font-weight-semibold: 600       /* 半粗 */
--font-weight-bold: 700           /* 粗体 */
```

### 间距系统（8px 基准）

```css
--spacing-xs: 4px                 /* 超小间距 */
--spacing-sm: 8px                 /* 小间距 */
--spacing-md: 16px                /* 中等间距 */
--spacing-lg: 24px                /* 大间距 */
--spacing-xl: 32px                /* 超大间距 */
--spacing-2xl: 48px               /* 特大间距 */
--spacing-3xl: 64px               /* 巨大间距 */
```

### 圆角系统

```css
--radius-sm: 6px                  /* 小圆角 */
--radius-md: 8px                  /* 中圆角 */
--radius-lg: 12px                 /* 大圆角 */
--radius-xl: 14px                 /* 超大圆角 */
--radius-2xl: 16px                /* 特大圆角 */
--radius-3xl: 20px                /* 巨大圆角 */
--radius-full: 9999px             /* 完全圆形 */
```

### 阴影系统

```css
--shadow-sm: 0 2px 8px rgba(0, 67, 78, 0.12)     /* 小阴影 */
--shadow-md: 0 8px 16px rgba(0, 201, 152, 0.28)  /* 中阴影 */
--shadow-lg: 0 12px 30px rgba(0, 67, 78, 0.25)   /* 大阴影 */
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.5)       /* 超大阴影 */
```

### 过渡动画

```css
--transition-fast: 0.15s ease     /* 快速过渡 */
--transition-base: 0.2s ease      /* 标准过渡 */
--transition-slow: 0.3s ease-out  /* 慢速过渡 */
```

---

## 🧩 组件示例

### 按钮

#### 主要按钮
```css
.btn-primary {
  background: var(--gradient-primary);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 215, 168, 0.3);
}
```

#### 次要按钮
```css
.btn-secondary {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
}
```

### 表单输入

```css
.input {
  width: 100%;
  height: 56px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 var(--spacing-md) 0 42px;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 215, 168, 0.2);
}

.input::placeholder {
  color: var(--color-border-dark);
}
```

### 卡片

```css
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-3xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-lg);
}
```

---

## 📱 响应式断点

```css
/* 小屏手机 */
@media (max-width: 600px) { }

/* 大屏手机/平板竖屏 */
@media (max-width: 768px) { }

/* 平板横屏 */
@media (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }
```

---

## ♿ 可访问性标准

### 颜色对比度
- 正文文字：最低 4.5:1
- 大文字（18px+）：最低 3:1
- 交互元素：最低 3:1

### 触摸目标
- 移动设备：最小 44×44px
- 桌面设备：最小 24×24px

### 键盘导航
- 所有交互元素必须可通过键盘访问
- 清晰的焦点指示器
- 逻辑的 Tab 顺序

### 屏幕阅读器
- 语义化 HTML
- ARIA 标签
- alt 文本用于图像

---

## 🎯 使用指南

### 1. 使用设计令牌而非硬编码值

❌ **不推荐：**
```css
.my-element {
  color: #00d7a8;
  padding: 16px;
  font-size: 20px;
}
```

✅ **推荐：**
```css
.my-element {
  color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
}
```

### 2. 保持一致的间距

使用 8px 基准的间距系统：
- `--spacing-xs` (4px)
- `--spacing-sm` (8px)
- `--spacing-md` (16px)
- `--spacing-lg` (24px)
- `--spacing-xl` (32px)

### 3. 遵循模块化比例

字体大小遵循 1.25 的比例：
- 12px → 15px → 20px → 25px → 31px → 39px → 48px → 56px

---

## 📊 品牌色彩

### 主色：青绿色 (#00d7a8)
- 主要操作按钮
- 重要信息强调
- 成功状态指示

### 辅助色：蓝色 (#2f63a2)
- 链接
- 次要操作
- 信息提示

### 语义色
- 错误：红色 (#eb4335)
- 警告：橙色 (#cc8a00)
- 成功：绿色 (#00d7a8)

---

## 🔄 版本历史

### v1.0.0 (2026-04-22)
- 初始设计系统
- 定义颜色、字体、间距、圆角、阴影令牌
- 添加可访问性标准
- 创建组件使用指南

---

## 📞 联系方式

如有设计系统相关问题，请联系设计团队。

**保持一致性，打造卓越用户体验！** 🚀
