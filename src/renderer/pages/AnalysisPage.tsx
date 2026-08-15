import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Table, Progress, Empty } from 'antd';
import ReactEChartsCore from 'echarts-for-react';
import { WarningOutlined } from '@ant-design/icons';

const AnalysisPage: React.FC = () => {
  const [weakPoints, setWeakPoints] = useState<any[]>([]);
  const [hardQuestions, setHardQuestions] = useState<any[]>([]);

  useEffect(() => {
    window.api.analysis.weakPoints().then((r) => {
      setWeakPoints(r.weakPoints || []);
      setHardQuestions(r.hardQuestions || []);
    });
  }, []);

  const radarOption = {
    tooltip: { trigger: 'item' },
    radar: {
      indicator: weakPoints.slice(0, 8).map((w) => ({ name: w.tags, max: 100 })),
      shape: 'circle',
      splitNumber: 4,
    },
    series: [{
      type: 'radar',
      data: [{ value: weakPoints.slice(0, 8).map((w) => w.accuracy), name: '正确率', areaStyle: { color: 'rgba(22,119,255,0.2)' } }],
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: weakPoints.slice(0, 10).map((w) => w.tags) },
    yAxis: { type: 'value', max: 100, name: '正确率(%)' },
    series: [{
      type: 'bar',
      data: weakPoints.slice(0, 10).map((w) => ({
        value: w.accuracy,
        itemStyle: { color: w.accuracy < 60 ? '#ff4d4f' : w.accuracy < 80 ? '#faad14' : '#52c41a' },
      })),
    }],
  };

  const columns = [
    { title: '知识点', dataIndex: 'tags', key: 'tags', render: (t: string) => <Tag>{t}</Tag> },
    { title: '答题数', dataIndex: 'total', key: 'total' },
    { title: '正确数', dataIndex: 'correct', key: 'correct' },
    { title: '正确率', dataIndex: 'accuracy', key: 'accuracy', render: (v: number) => (
      <Progress percent={Math.round(v)} size="small" status={v < 60 ? 'exception' : v < 80 ? 'active' : 'success'} />
    )},
    { title: '状态', key: 'status', render: (_: any, r: any) => {
      if (r.accuracy < 60) return <Tag color="red">薄弱点</Tag>;
      if (r.accuracy < 80) return <Tag color="orange">需巩固</Tag>;
      return <Tag color="green">良好</Tag>;
    }},
  ];

  return (
    <div>
      <div className="page-header">
        <h2>学习分析</h2>
        <p>洞察薄弱点，精准提升</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="知识点雷达图">
            {weakPoints.length > 0 ? <ReactEChartsCore option={radarOption} style={{ height: 320 }} /> : <Empty description="暂无数据，开始答题吧" />}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="知识点正确率">
            {weakPoints.length > 0 ? <ReactEChartsCore option={barOption} style={{ height: 320 }} /> : <Empty description="暂无数据" />}
          </Card>
        </Col>
      </Row>
      <Card title="薄弱点详情" style={{ marginTop: 16 }}>
        <Table
          dataSource={weakPoints}
          columns={columns}
          rowKey="tags"
          pagination={false}
          locale={{ emptyText: '暂无薄弱点数据' }}
        />
      </Card>
      {hardQuestions.length > 0 && (
        <Card title="重难点题目" style={{ marginTop: 16 }}>
          {hardQuestions.map((q: any) => (
            <Card key={q.id} size="small" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <Tag color="red" icon={<WarningOutlined />}>错题 {q.wrong_count} 次</Tag>
                  <span>{q.content?.slice(0, 100)}</span>
                </div>
                <Tag color="blue">{q.tags}</Tag>
              </div>
            </Card>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AnalysisPage;