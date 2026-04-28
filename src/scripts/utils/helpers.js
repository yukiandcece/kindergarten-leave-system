/**
 * 通用工具函数
 */

import Logger from './logger.js';

/**
 * 格式化日期时间
 * @param {Date} date - 日期对象
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateTime(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 生成随机数字
 * @param {number} length - 数字长度
 * @returns {string} 随机数字字符串
 */
export function generateRandomNumber(length = 16) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 本地存储工具
 */
export const Storage = {
  /**
   * 设置本地存储
   * @param {string} key - 键
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      Logger.error('Failed to save to localStorage', error, 'Storage.set');
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) {
        return defaultValue;
      }
      return JSON.parse(serialized);
    } catch (error) {
      Logger.error('Failed to read from localStorage', error, 'Storage.get');
      return defaultValue;
    }
  },

  /**
   * 删除本地存储
   * @param {string} key - 键
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      Logger.error('Failed to remove from localStorage', error, 'Storage.remove');
    }
  },

  /**
   * 清空所有本地存储
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      Logger.error('Failed to clear localStorage', error, 'Storage.clear');
    }
  }
};

/**
 * URL 参数工具
 */
export const URLParams = {
  /**
   * 获取URL参数
   * @param {string} name - 参数名
   * @param {string} url - URL字符串
   * @returns {string|null} 参数值
   */
  get(name, url = window.location.href) {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(name);
  },

  /**
   * 设置URL参数
   * @param {string} name - 参数名
   * @param {string} value - 参数值
   * @param {string} url - URL字符串
   * @returns {string} 新的URL
   */
  set(name, value, url = window.location.href) {
    const urlObj = new URL(url);
    urlObj.searchParams.set(name, value);
    return urlObj.toString();
  },

  /**
   * 删除URL参数
   * @param {string} name - 参数名
   * @param {string} url - URL字符串
   * @returns {string} 新的URL
   */
  remove(name, url = window.location.href) {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(name);
    return urlObj.toString();
  }
};

/**
 * 数据分页工具
 * @param {Array} data - 数据数组
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @returns {Object} 分页结果
 */
export function paginate(data, page = 1, pageSize = 10) {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = data.slice(startIndex, endIndex);

  return {
    data: pageData,
    currentPage,
    totalPages,
    totalItems: data.length,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

/**
 * 安全的HTML转义
 * @param {string} html - HTML字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}