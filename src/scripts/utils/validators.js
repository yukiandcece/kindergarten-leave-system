/**
 * 表单验证工具
 * 提供常用的表单验证方法
 */

export const Validators = {
  /**
   * 验证手机号
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * 验证验证码
   * @param {string} code - 验证码
   * @param {number} length - 期望长度
   * @returns {boolean} 是否有效
   */
  isValidCode(code, length = 4) {
    return /^\d+$/.test(code) && code.length === length;
  },

  /**
   * 验证NFC卡号
   * @param {string} nfcNo - NFC卡号
   * @returns {boolean} 是否有效
   */
  isValidNFCNo(nfcNo) {
    // NFC卡号通常以NFC开头，后跟数字
    return /^NFC\d+$/.test(nfcNo);
  },

  /**
   * 验证IC卡号（向后兼容）
   * @param {string} cardNo - IC卡号
   * @returns {boolean} 是否有效
   * @deprecated 请使用 isValidNFCNo 代替
   */
  isValidCardNo(cardNo) {
    // IC卡号通常以IC开头，后跟数字
    return /^IC\d+$/.test(cardNo);
  },

  /**
   * 验证姓名
   * @param {string} name - 姓名
   * @returns {boolean} 是否有效
   */
  isValidName(name) {
    // 中文姓名，2-4个字符
    return /^[\u4e00-\u9fa5]{2,4}$/.test(name);
  },

  /**
   * 验证非空
   * @param {string} value - 值
   * @returns {boolean} 是否非空
   */
  isNotEmpty(value) {
    return value && value.trim().length > 0;
  },

  /**
   * 验证长度
   * @param {string} value - 值
   * @param {number} min - 最小长度
   * @param {number} max - 最大长度
   * @returns {boolean} 是否在范围内
   */
  isValidLength(value, min, max) {
    const length = value ? value.trim().length : 0;
    return length >= min && length <= max;
  }
};

/**
 * 表单验证类
 */
export class FormValidator {
  constructor() {
    this.errors = [];
  }

  /**
   * 验证字段
   * @param {string} value - 值
   * @param {Array} rules - 验证规则数组
   * @returns {boolean} 是否通过验证
   */
  validateField(value, rules) {
    this.errors = [];

    for (const rule of rules) {
      const { validator, message } = rule;

      if (!validator(value)) {
        this.errors.push(message);
        return false;
      }
    }

    return true;
  }

  /**
   * 获取错误信息
   * @returns {Array} 错误信息数组
   */
  getErrors() {
    return this.errors;
  }

  /**
   * 获取第一个错误信息
   * @returns {string|null} 错误信息
   */
  getFirstError() {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  /**
   * 清除错误
   */
  clearErrors() {
    this.errors = [];
  }
}

/**
 * 手机号输入限制
 * 只允许输入数字，最多11位
 * @param {HTMLInputElement} input - 输入框元素
 */
export function restrictPhoneInput(input) {
  input.addEventListener('input', () => {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    input.value = value;
  });
}

/**
 * 验证码输入限制
 * 只允许输入数字，限制长度
 * @param {HTMLInputElement} input - 输入框元素
 * @param {number} maxLength - 最大长度
 */
export function restrictCodeInput(input, maxLength = 4) {
  input.addEventListener('input', () => {
    let value = input.value.replace(/\D/g, '');
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
    input.value = value;
  });
}