import AutoLaunch from 'auto-launch';
import { queryOne, run } from './database';
import { isLinux, getAutoLaunchPath } from '../shared/platform';

const autoLauncher = new AutoLaunch({
  name: '智学助手',
  path: getAutoLaunchPath(),
});

export async function setupAutoLaunch() {
  const row = queryOne('SELECT value FROM settings WHERE key = ?', ['auto_launch']);
  const enabled = row?.value === 'true';

  try {
    const isEnabled = await autoLauncher.isEnabled();
    if (enabled && !isEnabled) {
      await autoLauncher.enable();
    } else if (!enabled && isEnabled) {
      await autoLauncher.disable();
    }
  } catch {
    // silently fail
  }
}

export async function toggleAutoLaunch(enabled: boolean) {
  run('UPDATE settings SET value = ? WHERE key = ?', [enabled ? 'true' : 'false', 'auto_launch']);
  await setupAutoLaunch();
}