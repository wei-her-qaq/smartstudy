import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, List, message, Progress } from 'antd';
import { ReloadOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';

const SolutionPage: React.FC = () => {
  const [weakPoints, setWeakPoints] = useState<any[]>([]);
  const [hardQuestions, setHardQuestions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const r = await window.api.analysis.weakPoints();
    setWeakPoints(r.weakPoints || []);
    setHardQuestions(r.hardQuestions || []);
  };

  const weakItems = weakPoints.filter((w) => w.accuracy < 80);

  const generateReview = async () => {
    const apiKey = await window.api.settings.get('ai_api_key');
    if (!apiKey) { message.warning('请先在设置中配置 AI API Key'); return; }
    message.loading('AI 正在生成复习方案...');
    const weakTags = weakItems.map((w) => w.tags).join('、');
    try {
      const baseUrl = await window.api.settings.get('ai_base_url');
      const model = await window.api.settings.get('ai_model');
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一个学习规划师。根据用户薄弱知识点，给出详细的复习计划和解决措施。' },
            { role: 'user', content: `我的薄弱知识点是：${weakTags}。请给出针对性的复习建议和学习计划。` },
          ],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '无法生成';
      message.success('复习方案已生成');
      window.api.notification.send('学习建议', `已生成针对 ${weakTags} 的复习方案`);
    } catch { message.error('生成失败，请检查 AI 配置'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2>解决措施</h2>
        <p>针对薄弱点，提供精准提升方案</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title="薄弱知识点"
            extra={<Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>}
          >
            <List
              dataSource={weakItems}
              renderItem={(item: any) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Tag color={item.accuracy < 60 ? 'red' : 'orange'}>{item.tags}</Tag>
                      <span style={{ color: '#888' }}>正确率 {item.accuracy}%</span>
                    </div>
                    <Progress percent={Math.round(item.accuracy)} size="small" status={item.accuracy < 60 ? 'exception' : 'active'} />
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无薄弱点，继续保持！' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="AI 智能建议"
            extra={<Button type="primary" icon={<FileTextOutlined />} onClick={generateReview}>生成复习方案</Button>}
          >
            <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, marginBottom: 16 }}>
              <p><BookOutlined /> 根据你的答题数据，系统建议：</p>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2, color: '#555' }}>
                {weakItems.length > 0 ? (
                  weakItems.slice(0, 5).map((w: any) => (
                    <li key={w.tags}>
                      <strong>{w.tags}</strong>：正确率 {w.accuracy}%，建议每天练习 {Math.max(5, Math.round((100 - w.accuracy) / 10))} 题
                    </li>
                  ))
                ) : <li>暂无建议，继续努力学习吧！</li>}
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
      {hardQuestions.length > 0 && (
        <Card title="错题重练" style={{ marginTop: 16 }}>
          {hardQuestions.map((q: any) => (
            <Card key={q.id} size="small" style={{ marginBottom: 8, borderLeft: '3px solid #ff4d4f' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ flex: 1 }}>{q.content?.slice(0, 120)}</span>
                <Button size="small" onClick={() => window.location.hash = `/practice/${q.subject_id}`}>去练习</Button>
              </div>
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default SolutionPage;