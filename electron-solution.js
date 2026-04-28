// Electron主进程 - 可以直接连接MySQL
const { app, BrowserWindow } = require('electron');
const mysql = require('mysql2');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// 暴露给前端的数据库API
const dbConfig = {
  host: '47.97.213.134',
  port: 3306,
  user: 'baicy',
  password: 'baicy123',
  database: 'jxt_dev'
};

// 在渲染进程中可以通过 window.electronAPI 访问
const { ipcMain } = require('electron');

ipcMain.handle('query-student-contacts', async (event, page, pageSize) => {
  const connection = mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.promise().execute(`
      SELECT id, cellphone FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `, [pageSize, (page - 1) * pageSize]);

    const [countResult] = await connection.promise().execute(`
      SELECT COUNT(*) as total FROM tbl_jxt_student_contact
      WHERE cellphone IS NOT NULL AND cellphone != ''
    `);

    return {
      success: true,
      data: rows,
      total: countResult[0].total
    };
  } finally {
    connection.end();
  }
});
