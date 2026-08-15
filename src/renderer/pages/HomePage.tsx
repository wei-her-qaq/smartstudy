import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  TimerIcon, EditIcon, GlobeIcon, BookIcon,
  CalculatorIcon, LightbulbIcon, ScrollIcon, CheckIcon,
  ChartIcon, ReadingIcon, HeadphonesIcon, MicIcon,
} from '../components/Icons';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ tomatoCount: 0, totalMinutes: 0, checkinDays: 0, questionCount: 0 });

  useEffect(() => {
    (async () => {
      const tomatoStats = await window.api.tomato.getStats(30);
      const checkins = await window.api.checkin.getCalendar(new Date().toISOString().slice(0, 7));
      setStats({
        tomatoCount: tomatoStats.total?.count || 0,
        totalMinutes: tomatoStats.total?.total_duration || 0,
        checkinDays: checkins.length,
        questionCount: 0,
      });
    })();
    window.api.analysis.weakPoints().then((r) => {
      const total = r.weakPoints.reduce((s, w) => s + w.total, 0);
      setStats((prev) => ({ ...prev, questionCount: total }));
    });
  }, []);

  const tiles = [
    { label: '番茄钟', desc: '专注计时', icon: TimerIcon, path: '/tomato', color: '#fa5c5c' },
    { label: '刷题练习', desc: '选择科目开始', icon: EditIcon, path: '/practice', color: '#1677ff' },
    { label: '英语训练', desc: '初中到雅思', icon: GlobeIcon, path: '/english', color: '#52c41a' },
    { label: '双语阅读', desc: '诗歌·小说·期刊', icon: ReadingIcon, path: '/english/reading', color: '#722ed1' },
    { label: '听力训练', desc: '分级听力', icon: HeadphonesIcon, path: '/english/listening', color: '#13c2c2' },
    { label: '口语训练', desc: '跟读·评分', icon: MicIcon, path: '/english/speaking', color: '#fa8c16' },
    { label: '初高中知识', desc: '九科全覆盖', icon: CalculatorIcon, path: '/k12', color: '#2f54eb' },
    { label: '生活常识', desc: '每日一条', icon: LightbulbIcon, path: '/life-tips', color: '#eb2f96' },
    { label: '技能证书', desc: '驾照·计算机', icon: ScrollIcon, path: '/cert', color: '#faad14' },
    { label: '待办事项', desc: '任务管理', icon: CheckIcon, path: '/todo', color: '#52c41a' },
    { label: '学习分析', desc: '薄弱点检测', icon: ChartIcon, path: '/analysis', color: '#1677ff' },
    { label: '题库管理', desc: 'AI生成·导入', icon: BookIcon, path: '/question-bank', color: '#722ed1' },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div>
          <h2>欢迎回来，同学</h2>
          <p>继续你的学习之旅 · 今日已专注 {Math.round(stats.totalMinutes / 60)} 分钟 · 打卡 {stats.checkinDays} 天</p>
        </div>
        <div className="hero-banner-icon">📘</div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-value">{stats.tomatoCount}</div>
            <div className="stat-label">本月番茄钟</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.totalMinutes / 60)}</div>
            <div className="stat-label">学习时长(小时)</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-value">{stats.checkinDays}</div>
            <div className="stat-label">打卡天数</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card">
            <div className="stat-value">{stats.questionCount}</div>
            <div className="stat-label">答题数</div>
          </div>
        </Col>
      </Row>

      {/* Launch Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className="launch-tile"
              onClick={() => navigate(tile.path)}
              style={{
                animation: `staggerIn 0.3s var(--ease-out-back) ${i * 0.04}s forwards`,
                opacity: 0,
              }}
            >
              <div className="launch-tile-icon" style={{ background: tile.color + '15', color: tile.color }}>
                <Icon size={28} color={tile.color} />
              </div>
              <div className="launch-tile-title">{tile.label}</div>
              <div className="launch-tile-desc">{tile.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;