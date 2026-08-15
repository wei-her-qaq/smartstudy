import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Tag, Typography, Input, Empty } from 'antd';
import { BookOutlined, CalculatorOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理'];

const K12Page: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('数学');
  const [points, setPoints] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    window.api.k12.getBySubject(selectedSubject).then((p) => {
      setPoints(p);
      setFiltered(p);
    });
  }, [selectedSubject]);

  useEffect(() => {
    if (search) {
      setFiltered(points.filter((p) => p.title.includes(search) || p.content.includes(search) || p.chapter.includes(search)));
    } else {
      setFiltered(points);
    }
  }, [search, points]);

  const chapters = [...new Set(filtered.map((p) => p.chapter))];

  return (
    <div>
      <div className="page-header">
        <h2>初高中各科知识</h2>
        <p>知识点梳理 · 公式定理 · 章节学习</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          {subjects.map((s) => (
            <Card
              key={s}
              size="small"
              className="card-hover"
              style={{ marginBottom: 8, textAlign: 'center', background: selectedSubject === s ? '#e6f4ff' : '#fff' }}
              onClick={() => setSelectedSubject(s)}
            >
              {s}
            </Card>
          ))}
        </Col>
        <Col span={20}>
          <Input.Search
            placeholder="搜索知识点..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          {filtered.length === 0 && (
            <Card>
              <Empty description="暂无知识点数据。请先在题库中添加题目，或使用 AI 生成功能补充知识点内容。" />
            </Card>
          )}
          {chapters.map((chapter) => (
            <Card key={chapter} title={chapter as string} style={{ marginBottom: 16 }}>
              {filtered.filter((p) => p.chapter === chapter).map((point) => (
                <Card key={point.id} size="small" style={{ marginBottom: 8 }} type="inner" title={point.title}>
                  <Paragraph>{point.content}</Paragraph>
                  {point.formulas && (
                    <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, marginTop: 8 }}>
                      <Text strong><CalculatorOutlined /> 公式：</Text>
                      <Text code style={{ fontSize: 14 }}>{point.formulas}</Text>
                    </div>
                  )}
                  {point.key_points && (
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">重点</Tag>
                      <Text>{point.key_points}</Text>
                    </div>
                  )}
                  <Tag style={{ marginTop: 4 }}>{point.grade}</Tag>
                </Card>
              ))}
            </Card>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default K12Page;