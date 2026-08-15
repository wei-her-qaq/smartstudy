import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { BookOutlined, ClockCircleOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const HomePage: React.FC = () => {
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

  return (
    <div>
      <div className="page-header">
        <h2>欢迎回来</h2>
        <p>继续你的学习之旅</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="本月番茄钟" value={stats.tomatoCount} prefix={<ClockCircleOutlined />} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="学习时长" value={Math.round(stats.totalMinutes / 60)} prefix={<BookOutlined />} suffix="小时" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="打卡天数" value={stats.checkinDays} prefix={<CheckCircleOutlined />} suffix="天" />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic title="答题数" value={stats.questionCount} prefix={<BarChartOutlined />} suffix="题" />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="快速开始" className="card-hover">
            <Row gutter={[12, 12]}>
              <Col span={8}><Card size="small" onClick={() => window.location.hash = '/tomato'}>🍅 番茄钟</Card></Col>
              <Col span={8}><Card size="small" onClick={() => window.location.hash = '/practice'}>✏️ 开始刷题</Card></Col>
              <Col span={8}><Card size="small" onClick={() => window.location.hash = '/english'}>🌍 学英语</Card></Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="今日建议">
            <p>完成今日学习计划，保持连续打卡</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;