/**
 * Toast 通知系统
 * 替代 alert 和 confirm 的专业通知方案
 */

import { getIcon } from './icons.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.toastId = 0;
    this.defaultDuration = 4000;
    this.position = 'top-right'; // top-right, top-left, top-center, bottom-right, bottom-left, bottom-center
  }

  /**
   * 初始化 Toast 容器
   */
  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = `toast-container ${this.position}`;
    document.body.appendChild(this.container);
  }

  /**
   * 显示 Toast 通知
   * @param {Object} options - Toast 配置
   * @param {string} options.type - 通知类型: 'success', 'error', 'warning', 'info'
   * @param {string} options.title - 标题
   * @param {string} options.message - 消息内容
   * @param {number} options.duration - 持续时间（毫秒），0 表示不自动关闭
   * @param {boolean} options.showClose - 显示关闭按钮
   * @param {boolean} options.showProgress - 显示进度条
   * @param {Function} options.onClose - 关闭回调
   * @returns {number} Toast ID
   */
  show(options) {
    this.init();

    const {
      type = 'info',
      title = '',
      message = '',
      duration = this.defaultDuration,
      showClose = true,
      showProgress = duration > 0,
      onClose = null
    } = options;

    const id = ++this.toastId;
    const toast = this.createToastElement({
      id,
      type,
      title,
      message,
      showClose,
      showProgress,
      duration
    });

    this.container.appendChild(toast);
    this.toasts.push({ id, element: toast, onClose });

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * 创建 Toast 元素
   */
  createToastElement({ id, type, title, message, showClose, showProgress, duration }) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.dataset.id = id;

    // 图标映射
    const icons = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    const iconHtml = getIcon(icons[type] || 'info', 'toast-icon');

    toast.innerHTML = `
      ${iconHtml}
      <div class="toast-content">
        ${title ? `<h4 class="toast-title">${this.escapeHtml(title)}</h4>` : ''}
        ${message ? `<p class="toast-message">${this.escapeHtml(message)}</p>` : ''}
      </div>
      ${showClose ? '<button class="toast-close" onclick="this.parentElement.remove()">&times;</button>' : ''}
      ${showProgress ? `<div class="toast-progress"><div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div></div>` : ''}
    `;

    return toast;
  }

  /**
   * 移除 Toast
   * @param {number} id - Toast ID
   */
  remove(id) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const { element, onClose } = this.toasts[index];
    element.classList.add('removing');

    setTimeout(() => {
      if (element.parentElement) {
        element.remove();
      }
      if (onClose) {
        onClose();
      }
      this.toasts.splice(index, 1);
    }, 300); // 等待动画完成
  }

  /**
   * 清除所有 Toast
   */
  clear() {
    this.toasts.forEach(({ id }) => this.remove(id));
  }

  /**
   * 快捷方法：成功提示
   */
  success(message, title = '操作成功') {
    return this.show({ type: 'success', title, message });
  }

  /**
   * 快捷方法：错误提示
   */
  error(message, title = '操作失败') {
    return this.show({ type: 'error', title, message, duration: 5000 });
  }

  /**
   * 快捷方法：警告提示
   */
  warning(message, title = '注意') {
    return this.show({ type: 'warning', title, message });
  }

  /**
   * 快捷方法：信息提示
   */
  info(message, title = '') {
    return this.show({ type: 'info', title, message });
  }

  /**
   * 设置位置
   * @param {string} position - 位置
   */
  setPosition(position) {
    this.position = position;
    if (this.container) {
      this.container.className = `toast-container ${position}`;
    }
  }

  /**
   * HTML 转义，防止 XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 创建全局实例
const toast = new ToastManager();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => toast.init());
} else {
  toast.init();
}

export default toast;