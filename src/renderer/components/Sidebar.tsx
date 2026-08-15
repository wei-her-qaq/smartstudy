import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { section: '学习', items: [
    { label: '首页', icon: '🏠', path: '/' },
    { label: '番茄钟', icon: '⏰', path: '/tomato' },
    { label: '学习计划', icon: '📋', path: '/study-plan' },
    { label: '待办事项', icon: '✅', path: '/todo' },
  ]},
  { section: '题库', items: [
    { label: '题库管理', icon: '📚', path: '/question-bank' },
    { label: '刷题练习', icon: '✏️', path: '/practice' },
    { label: '学习分析', icon: '📊', path: '/analysis' },
    { label: '解决措施', icon: '💡', path: '/solution' },
  ]},
  { section: '英语', items: [
    { label: '英语训练', icon: '🌍', path: '/english' },
    { label: '双语阅读', icon: '📖', path: '/english/reading' },
    { label: '听力训练', icon: '🎧', path: '/english/listening' },
    { label: '口语训练', icon: '🎤', path: '/english/speaking' },
  ]},
  { section: '知识库', items: [
    { label: '初高中各科', icon: '📐', path: '/k12' },
    { label: '生活常识', icon: '💡', path: '/life-tips' },
    { label: '技能证书', icon: '📜', path: '/cert' },
    { label: '素材管理', icon: '📦', path: '/pack-manager' },
  ]},
  { section: '系统', items: [
    { label: '设置', icon: '⚙️', path: '/settings' },
  ]},
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">📘</span>
        <span className="sidebar-logo-text">智学助手</span>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((section) => (
          <div className="sidebar-section" key={section.section}>
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;