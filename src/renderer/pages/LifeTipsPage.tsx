import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Input, message, Button, List, Space } from 'antd';
import { SearchOutlined, HeartOutlined, HeartFilled, GlobalOutlined } from '@ant-design/icons';

const categories = [
  { label: '健康医疗', value: 'health' },
  { label: '安全急救', value: 'safety' },
  { label: '理财投资', value: 'finance' },
  { label: '法律常识', value: 'law' },
  { label: '饮食营养', value: 'food' },
  { label: '环保节能', value: 'environment' },
  { label: '交通出行', value: 'travel' },
  { label: '科技数码', value: 'tech' },
];

const LifeTipsPage: React.FC = () => {
  const [tips, setTips] = useState<any[]>([]);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (search) {
      window.api.lifeTips.search(search).then(setTips);
    } else {
      window.api.lifeTips.getAll(category).then(setTips);
    }
  }, [category, search]);

  const toggleFavorite = async (id: number) => {
    await window.api.lifeTips.toggleFavorite(id);
    setTips((prev) => prev.map((t) => t.id === id ? { ...t, is_favorite: t.is_favorite ? 0 : 1 } : t));
  };

  const fetchOnline = async () => {
    message.loading('正在联网收录生活常识...');
    const apiKey = await window.api.settings.get('ai_api_key');
    if (!apiKey) { message.warning('请先在设置中配置 AI API Key'); return; }
    try {
      const baseUrl = await window.api.settings.get('ai_base_url');
      const model = await window.api.settings.get('ai_model');
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一个生活常识专家。请提供日常生活中实用的常识，每条包含标题和详细内容，以JSON格式返回。' },
            { role: 'user', content: `请提供10条关于${category ? categories.find(c => c.value === category)?.label : '日常'}生活常识` },
          ],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      try {
        const items = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
        for (const item of items) {
          await window.api.lifeTips.add({
            category: category || 'health',
            title: item.title || item.topic,
            content: item.content || item.detail,
            source: 'AI 生成',
          });
        }
        message.success('收录完成');
        window.api.lifeTips.getAll(category).then(setTips);
      } catch { message.error('AI 返回格式错误'); }
    } catch { message.error('联网失败'); }
  };

  return (
    <div>
      <div className="page-header">
        <h2>生活常识</h2>
        <p>健康·安全·理财·法律 · 每天学一点</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Input.Search
            placeholder="搜索生活常识..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={8}>
          <Button icon={<GlobalOutlined />} onClick={fetchOnline} style={{ width: '100%' }}>联网收录</Button>
        </Col>
      </Row>
      <div style={{ margin: '16px 0' }}>
        <Space wrap>
          <Tag key="all" color={!category ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => { setCategory(undefined); setSearch(''); }}>全部</Tag>
          {categories.map((c) => (
            <Tag key={c.value} color={category === c.value ? 'blue' : 'default'} style={{ cursor: 'pointer' }} onClick={() => { setCategory(c.value); setSearch(''); }}>
              {c.label}
            </Tag>
          ))}
        </Space>
      </div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
        dataSource={tips}
        renderItem={(tip: any) => (
          <List.Item>
            <Card
              hoverable
              actions={[
                tip.is_favorite ? <HeartFilled key="fav" style={{ color: '#ff4d4f' }} onClick={() => toggleFavorite(tip.id)} /> : <HeartOutlined key="fav" onClick={() => toggleFavorite(tip.id)} />,
              ]}
            >
              <Tag color="green">{categories.find((c) => c.value === tip.category)?.label || tip.category}</Tag>
              <h4 style={{ margin: '8px 0' }}>{tip.title}</h4>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>{tip.content?.slice(0, 150)}</p>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: '暂无数据，点击"联网收录"获取' }}
      />
    </div>
  );
};

export default LifeTipsPage;