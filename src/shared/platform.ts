import { platform } from 'os';

export const isLinux = process.platform === 'linux';
export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';
export const isDev = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';

export function getAutoLaunchPath(): string {
  if (isLinux && process.env.APPIMAGE) {
    return process.env.APPIMAGE;
  }
  return process.execPath;
}

export function getTrayIconSize(): number {
  return isLinux ? 24 : 32;
}

export function getWindowOptions() {
  if (isLinux) {
    return { frame: true, titleBarStyle: undefined };
  }
  return { frame: false, titleBarStyle: 'hidden' as const };
}