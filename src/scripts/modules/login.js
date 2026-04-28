/**
 * 登录页面模块
 * 处理登录表单的交互和验证
 */

import toast from '../utils/toast.js';
import modal from '../utils/modal.js';
import { Validators, restrictPhoneInput, restrictCodeInput } from '../utils/validators.js';
import { Storage } from '../utils/helpers.js';
import { getIcon } from '../utils/icons.js';
import Logger from '../utils/logger.js';

class LoginModule {
  constructor() {
    this.selectedTarget = 'entry-shoot';
    this.countdownTimer = null;
    this.elements = {};
    this.init();
  }

  /**
   * 初始化模块
   */
  init() {
    this.cacheElements();
    this.bindEvents();
    this.replaceEmojiWithIcons();
    this.loadSavedTerminal();
  }

  /**
   * 缓存DOM元素
   */
  cacheElements() {
    this.elements = {
      tabButtons: document.querySelectorAll('.terminal-tabs .tab'),
      currentTerminalText: document.getElementById('currentTerminalText'),
      phoneInput: document.getElementById('phone'),
      codeInput: document.getElementById('code'),
      phoneError: document.getElementById('phone-error'),
      codeError: document.getElementById('code-error'),
      getCodeBtn: document.getElementById('getCodeBtn'),
      loginBtn: document.getElementById('loginBtn')
    };
  }

  /**
   * 绑定事件监听
   */
  bindEvents() {
    // 终端选择标签
    this.elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleTerminalChange(btn));
    });

    // 手机号输入
    if (this.elements.phoneInput) {
      restrictPhoneInput(this.elements.phoneInput);
      // 添加实时验证
      this.elements.phoneInput.addEventListener('blur', () => this.validatePhone());
      this.elements.phoneInput.addEventListener('input', () => {
        // 输入时清除错误状态
        if (this.elements.phoneInput.getAttribute('aria-invalid') === 'true') {
          this.clearPhoneError();
        }
      });
    }

    // 验证码输入
    if (this.elements.codeInput) {
      restrictCodeInput(this.elements.codeInput);
      // 添加实时验证
      this.elements.codeInput.addEventListener('blur', () => this.validateCode());
      this.elements.codeInput.addEventListener('input', () => {
        // 输入时清除错误状态
        if (this.elements.codeInput.getAttribute('aria-invalid') === 'true') {
          this.clearCodeError();
        }
      });
    }

    // 获取验证码按钮
    if (this.elements.getCodeBtn) {
      this.elements.getCodeBtn.addEventListener('click', () => this.handleGetCode());
    }

    // 登录按钮
    if (this.elements.loginBtn) {
      this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
    }
  }

  /**
   * 替换emoji图标为SVG图标
   */
  replaceEmojiWithIcons() {
    // 替换手机号图标
    const phoneIcon = document.querySelector('.input-with-icon:first-child .icon');
    if (phoneIcon && phoneIcon.textContent.includes('📱')) {
      phoneIcon.innerHTML = `<span class="icon icon-md icon-secondary">${require('../utils/icons.js').Icons.phone}</span>`;
    }

    // 替换验证码图标
    const codeIcon = document.querySelector('.input-with-icon:last-child .icon');
    if (codeIcon && codeIcon.textContent.includes('🔒')) {
      codeIcon.innerHTML = `<span class="icon icon-md icon-secondary">${require('../utils/icons.js').Icons.lock}</span>`;
    }
  }

  /**
   * 加载保存的终端选择
   */
  loadSavedTerminal() {
    const savedTerminal = Storage.get('selectedTerminal');
    if (savedTerminal) {
      const { target, label } = savedTerminal;
      this.selectedTarget = target;
      this.updateTerminalDisplay(label);
      this.updateActiveTab(target);
    }
  }

  /**
   * 处理终端切换
   * @param {HTMLElement} btn - 点击的标签按钮
   */
  handleTerminalChange(btn) {
    const terminalLabel = btn.dataset.terminalLabel || '';
    const target = btn.dataset.target || 'entry-shoot';

    // 更新状态
    this.selectedTarget = target;

    // 更新UI
    this.elements.tabButtons.forEach(item => item.classList.remove('tab-active'));
    btn.classList.add('tab-active');
    this.updateTerminalDisplay(terminalLabel);

    // 保存到本地存储
    Storage.set('selectedTerminal', { target, label: terminalLabel });

    // 显示提示
    toast.info(`已切换到${terminalLabel}`);
  }

  /**
   * 更新终端显示文本
   * @param {string} label - 终端标签
   */
  updateTerminalDisplay(label) {
    if (this.elements.currentTerminalText) {
      this.elements.currentTerminalText.textContent = `当前终端：${label}`;
    }
  }

  /**
   * 更新激活的标签
   * @param {string} target - 目标值
   */
  updateActiveTab(target) {
    this.elements.tabButtons.forEach(btn => {
      if (btn.dataset.target === target) {
        btn.classList.add('tab-active');
      } else {
        btn.classList.remove('tab-active');
      }
    });
  }

  /**
   * 处理获取验证码
   */
  async handleGetCode() {
    const phone = this.elements.phoneInput?.value.trim();

    // 验证手机号
    if (!this.validatePhone()) {
      this.elements.phoneInput?.focus();
      return;
    }

    // 禁用按钮
    this.setGetCodeButtonState(false);

    try {
      // 模拟发送验证码的API调用
      await this.mockSendCodeApi(phone);

      // 开始倒计时
      this.startCountdown();

      toast.success('验证码已发送');
    } catch (error) {
      // 记录异常日志
      Logger.exception(error, '验证码发送失败', 'LoginModule.handleGetCode');
      // 显示用户友好的错误提示
      toast.error('验证码发送失败，请稍后重试');
      this.setGetCodeButtonState(true);
    }
  }

  /**
   * 模拟发送验证码API
   * @param {string} phone - 手机号
   * @returns {Promise} API调用结果
   */
  mockSendCodeApi(phone) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Sending code to ${phone}`);
        resolve({ success: true });
      }, 500);
    });
  }

  /**
   * 开始倒计时
   */
  startCountdown() {
    let remain = 60;
    this.setGetCodeButtonState(false, `${remain}s`);

    this.countdownTimer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        this.stopCountdown();
        return;
      }
      this.setGetCodeButtonState(false, `${remain}s`);
    }, 1000);
  }

  /**
   * 停止倒计时
   */
  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.setGetCodeButtonState(true, '获取验证码');
  }

  /**
   * 设置获取验证码按钮状态
   * @param {boolean} enabled - 是否启用
   * @param {string} text - 按钮文本
   */
  setGetCodeButtonState(enabled, text = '获取验证码') {
    if (this.elements.getCodeBtn) {
      this.elements.getCodeBtn.disabled = !enabled;
      this.elements.getCodeBtn.textContent = text;
    }
  }

  /**
   * 处理登录
   */
  async handleLogin() {
    const phone = this.elements.phoneInput?.value.trim();
    const code = this.elements.codeInput?.value.trim();

    // 验证手机号
    if (!this.validatePhone()) {
      this.elements.phoneInput?.focus();
      return;
    }

    // 验证验证码
    if (!this.validateCode()) {
      this.elements.codeInput?.focus();
      return;
    }

    // 显示加载状态
    this.setLoginButtonState(false, '登录中...');

    try {
      // 模拟登录API调用
      await this.mockLoginApi(phone, code);

      toast.success('登录成功');

      // 根据选择的终端跳转
      setTimeout(() => {
        this.navigateToTarget();
      }, 1000);

    } catch (error) {
      // 记录异常日志
      Logger.exception(error, '登录失败', 'LoginModule.handleLogin');
      // 显示用户友好的错误提示
      toast.error('登录失败，请检查手机号和验证码');
      this.setLoginButtonState(true, '立即登录');
    }
  }

  /**
   * 模拟登录API
   * @param {string} phone - 手机号
   * @param {string} code - 验证码
   * @returns {Promise} API调用结果
   */
  mockLoginApi(phone, code) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Logging in with ${phone} and code ${code}`);
        resolve({ success: true });
      }, 800);
    });
  }

  /**
   * 跳转到目标页面
   */
  navigateToTarget() {
    if (this.selectedTarget === 'leave-detail.html') {
      window.location.href = './leave-detail.html';
    } else {
      // 其他终端的演示页面
      toast.info(`演示模式：${this.selectedTarget}`);
    }
  }

  /**
   * 验证手机号
   * @returns {boolean} 是否有效
   */
  validatePhone() {
    const phone = this.elements.phoneInput?.value.trim();
    const isValid = Validators.isValidPhone(phone);

    if (!isValid) {
      this.showPhoneError(phone.length === 0 ? '请输入手机号' : '请输入正确的11位手机号码');
    } else {
      this.clearPhoneError();
    }

    return isValid;
  }

  /**
   * 验证验证码
   * @returns {boolean} 是否有效
   */
  validateCode() {
    const code = this.elements.codeInput?.value.trim();
    const isValid = Validators.isValidCode(code);

    if (!isValid) {
      this.showCodeError(code.length === 0 ? '请输入验证码' : '请输入正确的4位数字验证码');
    } else {
      this.clearCodeError();
    }

    return isValid;
  }

  /**
   * 显示手机号错误
   * @param {string} message - 错误消息
   */
  showPhoneError(message) {
    if (this.elements.phoneInput) {
      this.elements.phoneInput.setAttribute('aria-invalid', 'true');
    }
    if (this.elements.phoneError) {
      this.elements.phoneError.textContent = message;
      this.elements.phoneError.classList.add('visible');
    }
  }

  /**
   * 清除手机号错误
   */
  clearPhoneError() {
    if (this.elements.phoneInput) {
      this.elements.phoneInput.setAttribute('aria-invalid', 'false');
    }
    if (this.elements.phoneError) {
      this.elements.phoneError.textContent = '';
      this.elements.phoneError.classList.remove('visible');
    }
  }

  /**
   * 显示验证码错误
   * @param {string} message - 错误消息
   */
  showCodeError(message) {
    if (this.elements.codeInput) {
      this.elements.codeInput.setAttribute('aria-invalid', 'true');
    }
    if (this.elements.codeError) {
      this.elements.codeError.textContent = message;
      this.elements.codeError.classList.add('visible');
    }
  }

  /**
   * 清除验证码错误
   */
  clearCodeError() {
    if (this.elements.codeInput) {
      this.elements.codeInput.setAttribute('aria-invalid', 'false');
    }
    if (this.elements.codeError) {
      this.elements.codeError.textContent = '';
      this.elements.codeError.classList.remove('visible');
    }
  }

  /**
   * 设置登录按钮状态
   * @param {boolean} enabled - 是否启用
   * @param {string} text - 按钮文本
   */
  setLoginButtonState(enabled, text = '立即登录') {
    if (this.elements.loginBtn) {
      this.elements.loginBtn.disabled = !enabled;
      this.elements.loginBtn.textContent = text;
    }
  }

  /**
   * 销毁模块
   */
  destroy() {
    // 清理定时器
    this.stopCountdown();

    // 清理事件监听
    // 注意：在实际应用中，应该保存事件监听器的引用以便移除
  }
}

// 初始化登录模块
document.addEventListener('DOMContentLoaded', () => {
  new LoginModule();
});

export default LoginModule;