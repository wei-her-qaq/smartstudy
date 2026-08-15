import { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, Notification } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDatabase } from './database';
import { registerIpcHandlers } from './ipc';
import { setupAutoLaunch } from './autoLaunch';
import { isLinux, isWindows, isMac, getWindowOptions, getTrayIconSize } from '../shared/platform';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';

function createWindow() {
  const winOpts = getWindowOptions();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    frame: isLinux ? true : false,
    titleBarStyle: isLinux ? undefined : 'hidden',
    icon: path.join(__dirname, isDev ? '../../resources/icon.png' : '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererPath = path.join(__dirname, '../renderer/index.html');
  if (isDev && fs.existsSync(rendererPath) === false) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(rendererPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, isDev ? '../../resources/icon.png' : '../../resources/icon.png');
  let icon: Electron.NativeImage;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHoSURBVEiJpZU9TsNAEIXfrNeOAwUlHVeIuAAlF0DiAkQkLkC4ABI3oEBSIiQKfog4AQVSAiVKCuRyvN53Z4e1YydGQqB8a/LmzbNvZ0f4xxBCqNXq0G63P0ajUfB9/4PneV9RFF2EEF8A/9647/MCfwCCEGKj0eg9Ho+3lVJv3vsPgiBop2n6ZrvdXgC4rvvdaDQ+x3H8KIR4B3BvAUCWZR+DMHwQQnxKKYflcnm2XC5PHMdpANA0TQcAruvixnFqURSdWZZ1AuDeA7iuWzEM4xYAz/NQr9eRZRkMw4CUEtM0RZ7nKJVKAQDbtrVlWQ5NpimA0gSA67qVpmleJ0ly5L1P0/S+rusXQRBcNABTUx7P8xAOAkRRhDzPEccxqtUqAEBFUZQaYzRN0xdyfP8BYH2vD1EUvZqmeZckybH3Pk3T+7quXwRBcGkApmnC8zxEUQQAyPMccRyjWq0CAAohhLIs6yeE+BYA3vsb6/0HAPM8/yqXy2flcvnNcZymAUDTNNw4Dm5zshRF0ZFlWScA7j2A67oNIYSr1+uI4xhhGKJUKgEAtFJqLKXcFUK8CiF6pml+A2B/ff7fBwBN0+T7+7s/Ho/B9/0PnuflIgzDMyHEN4B3Pz4B8G8+hRBCq9Xqwe12Px6Px+C57s8gCD6iKPpcFv8Anj5Dq0M3NCQAAAAASUVORK5CYII='
    );
  }
  const size = getTrayIconSize();
  icon = icon.resize({ width: size, height: size });

  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => mainWindow?.show() },
    { label: '开始番茄钟', click: () => mainWindow?.webContents.send('start-tomato') },
    { type: 'separator' },
    { label: '退出', click: () => { app.quit(); } },
  ]);
  tray.setToolTip('智学助手');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

function registerGlobalShortcuts() {
  globalShortcut.register('Alt+Space', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
  globalShortcut.register('Ctrl+Shift+T', () => {
    mainWindow?.webContents.send('start-tomato');
  });
}

function scheduleDailyReminder() {
  setInterval(() => {
    try {
      const db = require('./database');
      const row = db.queryOne('SELECT value FROM settings WHERE key = ?', ['daily_remind_time']);
      const remindTime = row?.value || '09:00';
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (timeStr === remindTime && Notification.isSupported()) {
        new Notification({
          title: '学习提醒',
          body: '到学习时间了！今天也要加油哦 💪',
        }).show();
      }
    } catch {}
  }, 60000);
}

app.whenReady().then(async () => {
  await initDatabase();
  registerIpcHandlers();
  setupAutoLaunch();
  createWindow();
  createTray();
  registerGlobalShortcuts();
  scheduleDailyReminder();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});