import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon, TimerIcon, ClipboardIcon, CheckIcon,
  BookIcon, EditIcon, ChartIcon, LightbulbIcon,
  GlobeIcon, ReadingIcon, HeadphonesIcon, MicIcon,
  CalculatorIcon, PackageIcon, SettingsIcon,
  ChevronLeftIcon,
} from './Icons';

interface NavItem {
  label: string;
  icon: React.FC<{ size?: number; color?: string }>;
  path: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const menuItems: NavSection[] = [
  {
    section: '学习',
    items: [
      { label: '首页', icon: HomeIcon, path: '/' },
      { label: '番茄钟', icon: TimerIcon, path: '/tomato' },
      { label: '学习计划', icon: ClipboardIcon, path: '/study-plan' },
      { label: '待办事项', icon: CheckIcon, path: '/todo' },
    ],
  },
  {
    section: '题库',
    items: [
      { label: '题库管理', icon: BookIcon, path: '/question-bank' },
      { label: '刷题练习', icon: EditIcon, path: '/practice' },
      { label: '学习分析', icon: ChartIcon, path: '/analysis' },
      { label: '解决措施', icon: LightbulbIcon, path: '/solution' },
    ],
  },
  {
    section: '英语',
    items: [
      { label: '英语训练', icon: GlobeIcon, path: '/english' },
      { label: '双语阅读', icon: ReadingIcon, path: '/english/reading' },
      { label: '听力训练', icon: HeadphonesIcon, path: '/english/listening' },
      { label: '口语训练', icon: MicIcon, path: '/english/speaking' },
    ],
  },
  {
    section: '知识库',
    items: [
      { label: '初高中各科', icon: CalculatorIcon, path: '/k12' },
      { label: '生活常识', icon: LightbulbIcon, path: '/life-tips' },
      { label: '技能证书', icon: ScrollIcon, path: '/cert' },
      { label: '素材管理', icon: PackageIcon, path: '/pack-manager' },
    ],
  },
  {
    section: '系统',
    items: [
      { label: '设置', icon: SettingsIcon, path: '/settings' },
    ],
  },
];

import { ScrollIcon } from './Icons';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-menu">
        {menuItems.map((section, si) => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item, ii) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <div
                  key={item.path}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    animation: `staggerIn 0.3s var(--ease-out-back) ${si * 0.03 + ii * 0.02}s forwards`,
                    opacity: 0,
                  }}
                >
                  <span className="sidebar-item-icon">
                    <Icon size={18} color={active ? 'var(--accent)' : 'currentColor'} />
                  </span>
                  <span className="sidebar-item-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sidebar-toggle">
        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? '展开' : '收起'}>
          <ChevronLeftIcon size={14} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;