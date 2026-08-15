import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Modal, Input, Select, DatePicker, message, Space, Empty, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, UndoOutlined, FlagOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const priorityConfig: Record<number, { color: string; label: string }> = {
  1: { color: 'red', label: '高' },
  2: { color: 'orange', label: '中' },
  3: { color: 'green', label: '低' },
};

const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(2);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    loadTodos();
    window.api.subjects.getAll().then(setSubjects);
  }, []);

  const loadTodos = async () => {
    const t = await window.api.todo.getAll();
    setTodos(t);
  };

  const create = async () => {
    if (!title.trim()) { message.warning('请输入标题'); return; }
    await window.api.todo.create({ title, description, priority });
    setModalOpen(false);
    setTitle('');
    setDescription('');
    message.success('待办已创建');
    loadTodos();
  };

  const toggle = async (id: number) => {
    await window.api.todo.toggle(id);
    loadTodos();
  };

  const remove = async (id: number) => {
    await window.api.todo.delete(id);
    message.success('已删除');
    loadTodos();
  };

  const pending = todos.filter(t => t.status !== 'completed');
  const completed = todos.filter(t => t.status === 'completed');

  return (
    <div>
      <div className="page-header">
        <h2>待办事项</h2>
        <p>管理学习任务，追踪完成进度</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title="待完成"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新建</Button>}
          >
            <List
              dataSource={pending}
              locale={{ emptyText: <Empty description="暂无待办事项" /> }}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button type="text" icon={<CheckCircleOutlined />} onClick={() => toggle(item.id)} />,
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(item.id)} />,
                  ]}
                >
                  <div style={{ flex: 1 }}>
                    <Space>
                      <Tag color={priorityConfig[item.priority]?.color}>{priorityConfig[item.priority]?.label}</Tag>
                      <span style={{ fontWeight: 500 }}>{item.title}</span>
                    </Space>
                    {item.description && <p style={{ color: '#888', fontSize: 13, margin: '4px 0 0 20px' }}>{item.description}</p>}
                    {item.due_date && <p style={{ color: '#999', fontSize: 12, margin: '2px 0 0 20px' }}>截止: {item.due_date}</p>}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="已完成">
            <List
              dataSource={completed}
              locale={{ emptyText: '暂无完成记录' }}
              renderItem={(item: any) => (
                <List.Item
                  actions={[<Button type="text" icon={<UndoOutlined />} onClick={() => toggle(item.id)} />]}
                >
                  <div style={{ flex: 1, textDecoration: 'line-through', color: '#999' }}>
                    <Space>
                      <Tag color="green">✓</Tag>
                      <span>{item.title}</span>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Modal title="新建待办" open={modalOpen} onOk={create} onCancel={() => setModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input placeholder="待办标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextArea rows={3} placeholder="描述（可选）" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select
            value={priority}
            onChange={setPriority}
            options={[
              { label: '🟥 高优先级', value: 1 },
              { label: '🟧 中优先级', value: 2 },
              { label: '🟩 低优先级', value: 3 },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TodoPage;