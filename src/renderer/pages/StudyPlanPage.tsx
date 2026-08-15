import React, { useState, useEffect } from 'react';
import { Card, Button, InputNumber, TimePicker, List, Tag, message, Modal, Input, Select, Row, Col, Calendar } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { CheckableTag } = Tag;

const StudyPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dailyGoal, setDailyGoal] = useState(30);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadPlans();
    loadCheckins();
    window.api.subjects.getAll().then(setSubjects);
  }, []);

  const loadPlans = async () => {
    const p = await window.api.plans.getAll();
    setPlans(p);
  };

  const loadCheckins = async () => {
    const month = dayjs().format('YYYY-MM');
    const c = await window.api.checkin.getCalendar(month);
    setCheckins(c);
  };

  const createPlan = async () => {
    if (!title) return;
    await window.api.plans.create({ title, subject_id: selectedSubject, daily_goal: dailyGoal });
    setModalOpen(false);
    setTitle('');
    message.success('计划创建成功');
    loadPlans();
  };

  const dateCellRender = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const checkin = checkins.find((c) => c.checkin_date === dateStr);
    if (checkin) {
      return (
        <div style={{ fontSize: 11, color: '#1677ff', textAlign: 'center' }}>
          <CheckCircleOutlined /> {checkin.total_minutes}分钟
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <h2>学习计划</h2>
        <p>制定计划，坚持打卡</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card
            title="我的计划"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建</Button>}
          >
            <List
              dataSource={plans}
              renderItem={(plan: any) => (
                <List.Item
                  actions={[<Tag color="blue">每日{plan.daily_goal}分钟</Tag>]}
                >
                  <List.Item.Meta title={plan.title} description={plan.remind_time ? `提醒: ${plan.remind_time}` : ''} />
                </List.Item>
              )}
              locale={{ emptyText: '暂无计划' }}
            />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="打卡日历">
            <Calendar fullscreen={false} cellRender={dateCellRender} />
          </Card>
        </Col>
      </Row>
      <Modal title="新建学习计划" open={modalOpen} onOk={createPlan} onCancel={() => setModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input placeholder="计划名称" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            placeholder="选择科目（可选）"
            allowClear
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={subjects.map((s: any) => ({ label: s.name, value: s.id }))}
          />
          <div>
            <span>每日目标：</span>
            <InputNumber value={dailyGoal} onChange={(v) => setDailyGoal(v || 30)} min={5} max={480} /> 分钟
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudyPlanPage;