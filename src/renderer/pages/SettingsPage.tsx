import React, { useEffect, useState } from 'react';
import { Card, Switch, Select, Input, InputNumber, message, Button, Row, Col, Menu } from 'antd';
import { SettingOutlined, BellOutlined, AudioOutlined, RobotOutlined, BgColorsOutlined, KeyOutlined, InfoCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTheme } from '../hooks/useTheme';

const settingsMenu = [
  { key: 'basic', icon: <SettingOutlined />, label: '基本设置' },
  { key: 'appearance', icon: <BgColorsOutlined />, label: '外观设置' },
  { key: 'ai', icon: <RobotOutlined />, label: 'AI 配置' },
  { key: 'notification', icon: <BellOutlined />, label: '通知设置' },
  { key: 'audio', icon: <AudioOutlined />, label: '音频设备' },
  { key: 'shortcut', icon: <KeyOutlined />, label: '快捷键' },
  { key: 'about', icon: <InfoCircleOutlined />, label: '关于' },
];

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [audioDevices, setAudioDevices] = useState<any[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    window.api.settings.getAll().then(setSettings);
    window.api.audio.getDevices().then(setAudioDevices);
  }, []);

  const update = async (key: string, value: string) => {
    await window.api.settings.set(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'auto_launch') {
      await window.api.autoLaunch.set(value === 'true');
    }
    message.success('设置已保存');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <Card title="基本设置">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>自启动</span>
                <Switch checked={settings.auto_launch === 'true'} onChange={(v) => update('auto_launch', v ? 'true' : 'false')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>每日提醒时间</span>
                <Input type="time" value={settings.daily_remind_time || '09:00'} onChange={(e) => update('daily_remind_time', e.target.value)} style={{ width: 120 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>番茄钟专注时长</span>
                <InputNumber min={5} max={120} value={parseInt(settings.tomato_work_duration || '25')} onChange={(v) => update('tomato_work_duration', String(v))} /> 分钟
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>短休息</span>
                <InputNumber min={1} max={30} value={parseInt(settings.tomato_short_break || '5')} onChange={(v) => update('tomato_short_break', String(v))} /> 分钟
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>长休息</span>
                <InputNumber min={5} max={60} value={parseInt(settings.tomato_long_break || '15')} onChange={(v) => update('tomato_long_break', String(v))} /> 分钟
              </div>
            </div>
          </Card>
        );
      case 'appearance':
        return (
          <Card title="外观设置">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>主题</span>
              <Select
                value={theme}
                onChange={(v) => setTheme(v)}
                options={[
                  { label: '☀️ 浅色', value: 'light' },
                  { label: '🌙 深色', value: 'dark' },
                ]}
                style={{ width: 140 }}
              />
            </div>
          </Card>
        );
      case 'ai':
        return (
          <Card title="AI 配置">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span>API Key</span>
                <Input.Password placeholder="sk-..." value={settings.ai_api_key || ''} onChange={(e) => update('ai_api_key', e.target.value)} style={{ marginTop: 4 }} />
              </div>
              <div>
                <span>API 地址</span>
                <Input placeholder="https://api.openai.com/v1" value={settings.ai_base_url || ''} onChange={(e) => update('ai_base_url', e.target.value)} style={{ marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>模型</span>
                <Select value={settings.ai_model || 'gpt-3.5-turbo'} onChange={(v) => update('ai_model', v)}
                  options={[
                    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                    { label: 'GPT-4', value: 'gpt-4' },
                    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
                    { label: 'DeepSeek', value: 'deepseek-chat' },
                    { label: '通义千问', value: 'qwen-plus' },
                  ]} style={{ width: 200 }} />
              </div>
              <Button type="primary" onClick={() => message.success('AI 配置已保存')}>测试连接</Button>
            </div>
          </Card>
        );
      case 'notification':
        return (
          <Card title="通知设置">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>启用通知</span>
                <Switch checked={settings.notification_enabled === 'true'} onChange={(v) => update('notification_enabled', v ? 'true' : 'false')} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>番茄钟完成提醒</span>
                <Switch defaultChecked onChange={(v) => {}} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>学习计划提醒</span>
                <Switch defaultChecked onChange={(v) => {}} />
              </div>
            </div>
          </Card>
        );
      case 'audio':
        return (
          <Card title="音频设备">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>输出设备</span>
                <Select placeholder="默认扬声器" style={{ width: 240 }} options={audioDevices.filter((d: any) => d.kind === 'audiooutput').map((d: any) => ({ label: d.label || '默认设备', value: d.deviceId }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>输入设备</span>
                <Select placeholder="默认麦克风" style={{ width: 240 }} options={audioDevices.filter((d: any) => d.kind === 'audioinput').map((d: any) => ({ label: d.label || '默认设备', value: d.deviceId }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>音量</span>
                <InputNumber min={0} max={100} value={parseInt(settings.audio_volume || '80')} onChange={(v) => update('audio_volume', String(v))} formatter={(v) => `${v}%`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>降噪</span>
                <Switch checked={settings.noise_reduction === 'true'} onChange={(v) => update('noise_reduction', v ? 'true' : 'false')} />
              </div>
            </div>
          </Card>
        );
      case 'shortcut':
        return (
          <Card title="快捷键">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>显示/隐藏窗口</span>
                <Input value="Alt + Space" disabled style={{ width: 150 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>开始/暂停番茄钟</span>
                <Input value="Ctrl + Shift + T" disabled style={{ width: 150 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>打开刷题</span>
                <Input value="Ctrl + Shift + P" disabled style={{ width: 150 }} />
              </div>
            </div>
          </Card>
        );
      case 'about':
        return (
          <Card title="关于">
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📘</div>
              <h2>智学助手 SmartStudy</h2>
              <p style={{ color: '#888' }}>版本 1.0.0</p>
              <p style={{ color: '#888', marginTop: 8 }}>智能学习辅助工具 · 番茄钟 · 题库 · 英语训练 · 知识库</p>
              <p style={{ color: '#999', marginTop: 16, fontSize: 13 }}>Electron + React + TypeScript + Ant Design + SQLite</p>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>设置</h2>
        <p>个性化配置你的学习助手</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={5}>
          <Card style={{ padding: 0 }}>
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key)}
              style={{ border: 'none' }}
              items={settingsMenu.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
            />
          </Card>
        </Col>
        <Col span={19}>
          {renderContent()}
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;