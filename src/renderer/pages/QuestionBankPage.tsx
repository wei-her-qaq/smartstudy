import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Input, message, Tabs, Modal, Upload, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, RobotOutlined, LinkOutlined, InboxOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Dragger } = Upload;

const QuestionBankPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(undefined);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [questionType, setQuestionType] = useState<string>('single_choice');
  const [options, setOptions] = useState('A. \nB. \nC. \nD. ');
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);

  useEffect(() => {
    window.api.subjects.getAll().then(setSubjects);
  }, []);

  const addQuestion = async () => {
    if (!content || !answer) { message.warning('请填写题目和答案'); return; }
    await window.api.questions.create({
      subject_id: selectedSubject, type: questionType, difficulty,
      content, options: questionType === 'single_choice' ? options : null,
      answer, explanation, tags, source: 'manual',
    });
    message.success('题目添加成功');
    setAddModalOpen(false);
    setContent(''); setAnswer(''); setExplanation(''); setTags('');
  };

  const generateByAI = async () => {
    if (!aiTopic) { message.warning('请输入主题'); return; }
    message.loading('AI 生成中...');
    const apiKey = await window.api.settings.get('ai_api_key');
    const baseUrl = await window.api.settings.get('ai_base_url');
    const model = await window.api.settings.get('ai_model');
    if (!apiKey) { message.error('请先在设置中配置 AI API Key'); return; }

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一个题目生成器。请生成选择题，每道题包含题目、四个选项、正确答案和解析。以JSON数组格式返回。' },
            { role: 'user', content: `生成${aiCount}道关于"${aiTopic}"的${difficulty}难度题目` },
          ],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      try {
        const questions = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
        for (const q of questions) {
          await window.api.questions.create({
            subject_id: selectedSubject, type: 'single_choice', difficulty,
            content: q.question || q.content, options: JSON.stringify(q.options),
            answer: q.answer, explanation: q.explanation, tags: aiTopic, source: 'ai',
          });
        }
        message.success(`成功生成 ${questions.length} 道题目`);
      } catch {
        message.error('AI 返回格式错误，请重试');
      }
    } catch (e) {
      message.error('AI 生成失败，请检查 API 配置');
    }
    setAiModalOpen(false);
  };

  const importFile = async (file: File) => {
    message.loading('导入中...');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      let count = 0;
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 2) {
          await window.api.questions.create({
            subject_id: selectedSubject, type: 'single_choice', difficulty: 3,
            content: parts[0], options: null, answer: parts[1],
            explanation: parts[2] || '', tags: 'imported', source: 'import',
          });
          count++;
        }
      }
      message.success(`成功导入 ${count} 道题目`);
    };
    reader.readAsText(file);
    return false;
  };

  return (
    <div>
      <div className="page-header">
        <h2>题库管理</h2>
        <p>管理题目、导入导出、AI 生成</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="选择科目"
            value={selectedSubject}
            onChange={setSelectedSubject}
            options={subjects.map((s: any) => ({ label: s.name, value: s.id }))}
          />
        </Col>
        <Col span={18}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>手动添加</Button>
          <Button icon={<RobotOutlined />} onClick={() => setAiModalOpen(true)} style={{ marginLeft: 8 }}>AI 生成</Button>
          <Upload beforeUpload={(file) => importFile(file)} showUploadList={false}>
            <Button icon={<UploadOutlined />} style={{ marginLeft: 8 }}>导入文件</Button>
          </Upload>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        <p>选择科目后，前往「刷题练习」页面开始做题</p>
      </Card>

      <Modal title="手动添加题目" open={addModalOpen} onOk={addQuestion} onCancel={() => setAddModalOpen(false)} width={640}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select value={questionType} onChange={setQuestionType} options={[
            { label: '单选题', value: 'single_choice' },
            { label: '多选题', value: 'multi_choice' },
            { label: '判断题', value: 'true_false' },
            { label: '填空题', value: 'fill_blank' },
          ]} />
          <TextArea rows={3} placeholder="题目内容" value={content} onChange={(e) => setContent(e.target.value)} />
          {questionType === 'single_choice' && (
            <TextArea rows={4} placeholder="选项（每行一个，如：A. xxx）" value={options} onChange={(e) => setOptions(e.target.value)} />
          )}
          <Input placeholder="正确答案" value={answer} onChange={(e) => setAnswer(e.target.value)} />
          <TextArea rows={2} placeholder="解析（可选）" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
          <Input placeholder="标签（逗号分隔，如：函数,导数）" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
      </Modal>

      <Modal title="AI 生成题目" open={aiModalOpen} onOk={generateByAI} onCancel={() => setAiModalOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input placeholder="输入主题（如：英语虚拟语气、二元一次方程）" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
          <div>数量：<Select value={aiCount} onChange={setAiCount} options={[5, 10, 15, 20].map((n) => ({ label: `${n}道`, value: n }))} /></div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionBankPage;