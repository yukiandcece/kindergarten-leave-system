/**
 * Modal 模态框系统
 * 替代 prompt 和 confirm 的专业对话框
 */

import { getIcon } from './icons.js';

class ModalManager {
  constructor() {
    this.currentModal = null;
  }

  /**
   * 创建基础模态框
   * @param {Object} options - 模态框配置
   * @returns {Promise} 返回用户操作结果
   */
  create(options) {
    return new Promise((resolve) => {
      const {
        title = '提示',
        message = '',
        type = 'info', // 'info', 'warning', 'error', 'success'
        showCancel = true,
        cancelText = '取消',
        confirmText = '确定',
        confirmButtonClass = 'modal-button-confirm',
        inputValue = '',
        placeholder = '',
        onConfirm = null,
        onCancel = null
      } = options;

      // 移除已存在的模态框
      if (this.currentModal) {
        this.currentModal.remove();
      }

      // 创建模态框元素
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      // 图标映射
      const icons = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success'
      };

      const iconHtml = getIcon(icons[type] || 'info');

      overlay.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${iconHtml} ${this.escapeHtml(title)}</h3>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <p class="modal-message">${this.escapeHtml(message)}</p>
            ${inputValue !== null ? `<input type="text" class="modal-input" placeholder="${this.escapeHtml(placeholder)}" value="${this.escapeHtml(inputValue)}">` : ''}
          </div>
          <div class="modal-footer">
            ${showCancel ? `<button class="modal-button modal-button-cancel">${this.escapeHtml(cancelText)}</button>` : ''}
            <button class="modal-button ${confirmButtonClass}">${this.escapeHtml(confirmText)}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.currentModal = overlay;

      // 获取元素
      const closeBtn = overlay.querySelector('.modal-close');
      const cancelBtn = overlay.querySelector('.modal-button-cancel');
      const confirmBtn = overlay.querySelector('.modal-button-confirm');
      const input = overlay.querySelector('.modal-input');

      // 聚焦输入框
      if (input) {
        setTimeout(() => input.focus(), 100);
      }

      // 关闭模态框函数
      const close = (result) => {
        overlay.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => {
          overlay.remove();
          this.currentModal = null;
          resolve(result);
        }, 200);
      };

      // 事件监听
      closeBtn.onclick = () => {
        if (onCancel) onCancel();
        close(null);
      };

      if (cancelBtn) {
        cancelBtn.onclick = () => {
          if (onCancel) onCancel();
          close(null);
        };
      }

      confirmBtn.onclick = () => {
        const value = input ? input.value.trim() : true;

        // 验证输入
        if (input && !value) {
          input.focus();
          return;
        }

        if (onConfirm) onConfirm(value);
        close(value);
      };

      // 回车键确认
      if (input) {
        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            confirmBtn.click();
          }
        };
      }

      // ESC 键关闭
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          closeBtn.click();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);

      // 点击背景关闭
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closeBtn.click();
        }
      };
    });
  }

  /**
   * 确认对话框
   * @param {string} message - 消息内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>} 用户是否确认
   */
  confirm(message, title = '确认操作') {
    return this.create({
      title,
      message,
      type: 'warning',
      confirmText: '确认',
      showCancel: true
    });
  }

  /**
   * 警告对话框
   * @param {string} message - 消息内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>} 用户是否确认
   */
  alert(message, title = '提示', type = 'info') {
    return this.create({
      title,
      message,
      type,
      confirmText: '我知道了',
      showCancel: false,
      inputValue: null
    });
  }

  /**
   * 输入对话框
   * @param {string} message - 消息内容
   * @param {string} placeholder - 输入框占位符
   * @param {string} defaultValue - 默认值
   * @param {string} title - 标题
   * @returns {Promise<string>} 用户输入的值
   */
  prompt(message, placeholder = '请输入', defaultValue = '', title = '输入') {
    return this.create({
      title,
      message,
      placeholder,
      inputValue: defaultValue,
      confirmText: '确定',
      showCancel: true
    });
  }

  /**
   * 成功提示
   */
  success(message, title = '操作成功') {
    return this.alert(message, title, 'success');
  }

  /**
   * 错误提示
   */
  error(message, title = '操作失败') {
    return this.alert(message, title, 'error');
  }

  /**
   * 警告提示
   */
  warning(message, title = '警告') {
    return this.alert(message, title, 'warning');
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 创建全局实例
const modal = new ModalManager();

export default modal;