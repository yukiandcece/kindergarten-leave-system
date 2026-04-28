/**
 * 日志记录工具
 * 提供统一的日志记录功能，支持多级别日志和持久化存储
 */

/**
 * 日志级别枚举
 */
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

/**
 * 日志配置
 */
const LogConfig = {
  // 最小日志级别（低于此级别的日志不会记录）
  minLevel: LogLevel.DEBUG,
  // 是否在控制台输出
  enableConsole: true,
  // 是否保存到本地存储
  enableStorage: true,
  // 本地存储的日志数量限制
  maxStorageLogs: 1000,
  // 本地存储的键名
  storageKey: 'app_logs'
};

/**
 * 日志记录器类
 */
class Logger {
  constructor() {
    this.logs = [];
    this.loadLogsFromStorage();
  }

  /**
   * 从本地存储加载日志
   */
  loadLogsFromStorage() {
    if (!LogConfig.enableStorage) return;

    try {
      const stored = localStorage.getItem(LogConfig.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
    }
  }

  /**
   * 保存日志到本地存储
   */
  saveLogsToStorage() {
    if (!LogConfig.enableStorage) return;

    try {
      // 限制日志数量
      const logsToSave = this.logs.slice(-LogConfig.maxStorageLogs);
      localStorage.setItem(LogConfig.storageKey, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {any} context - 上下文数据（如错误对象、额外数据等）
   * @param {string} module - 模块名称
   */
  log(level, message, context = null, module = 'App') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      module,
      context: this.serializeContext(context)
    };

    // 添加到内存日志
    this.logs.push(logEntry);

    // 控制台输出
    if (LogConfig.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // 保存到本地存储
    if (LogConfig.enableStorage) {
      this.saveLogsToStorage();
    }

    return logEntry;
  }

  /**
   * 序列化上下文数据
   * @param {any} context - 上下文数据
   * @returns {any} 序列化后的数据
   */
  serializeContext(context) {
    if (context === null || context === undefined) {
      return null;
    }

    // 如果是 Error 对象
    if (context instanceof Error) {
      return {
        name: context.name,
        message: context.message,
        stack: context.stack
      };
    }

    // 如果是对象或数组
    if (typeof context === 'object') {
      try {
        return JSON.parse(JSON.stringify(context));
      } catch (e) {
        return '[Unserializable Object]';
      }
    }

    return context;
  }

  /**
   * 输出到控制台
   * @param {Object} logEntry - 日志条目
   */
  outputToConsole(logEntry) {
    const { timestamp, level, message, module, context } = logEntry;
    const prefix = `[${timestamp}] [${level}] [${module}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context || '');
        break;
      default:
        console.log(prefix, message, context || '');
    }
  }

  /**
   * 记录 DEBUG 级别日志
   * @param {string} message - 日志消息
   * @param {any} context - 上下文数据
   * @param {string} module - 模块名称
   */
  debug(message, context = null, module = 'App') {
    return this.log(LogLevel.DEBUG, message, context, module);
  }

  /**
   * 记录 INFO 级别日志
   * @param {string} message - 日志消息
   * @param {any} context - 上下文数据
   * @param {string} module - 模块名称
   */
  info(message, context = null, module = 'App') {
    return this.log(LogLevel.INFO, message, context, module);
  }

  /**
   * 记录 WARN 级别日志
   * @param {string} message - 日志消息
   * @param {any} context - 上下文数据
   * @param {string} module - 模块名称
   */
  warn(message, context = null, module = 'App') {
    return this.log(LogLevel.WARN, message, context, module);
  }

  /**
   * 记录 ERROR 级别日志
   * @param {string} message - 日志消息
   * @param {any} context - 上下文数据
   * @param {string} module - 模块名称
   */
  error(message, context = null, module = 'App') {
    return this.log(LogLevel.ERROR, message, context, module);
  }

  /**
   * 记录异常（Error 对象）
   * @param {Error} error - 错误对象
   * @param {string} message - 附加消息
   * @param {string} module - 模块名称
   */
  exception(error, message = 'Exception occurred', module = 'App') {
    return this.error(message, error, module);
  }

  /**
   * 获取所有日志
   * @returns {Array} 日志数组
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * 根据级别过滤日志
   * @param {string} level - 日志级别
   * @returns {Array} 过滤后的日志数组
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 根据模块过滤日志
   * @param {string} module - 模块名称
   * @returns {Array} 过滤后的日志数组
   */
  getLogsByModule(module) {
    return this.logs.filter(log => log.module === module);
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    this.logs = [];
    if (LogConfig.enableStorage) {
      localStorage.removeItem(LogConfig.storageKey);
    }
  }

  /**
   * 导出日志为 JSON 字符串
   * @returns {string} JSON 字符串
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// 创建并导出单例实例
const logger = new Logger();

export { logger as Logger, LogLevel };
export default Logger;
