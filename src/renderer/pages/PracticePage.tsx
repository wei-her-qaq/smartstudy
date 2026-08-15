import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Radio, Checkbox, Input, Select, Tag, Progress, Row, Col, message } from 'antd';
import { CheckOutlined, CloseOutlined, RightOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const PracticePage: React.FC = () => {
  const { subjectId } = useParams();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<number | undefined>(subjectId ? parseInt(subjectId) : undefined);
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.api.subjects.getAll().then(setSubjects);
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!selectedSubject) return;
    setLoading(true);
    const qs = await window.api.questions.getBySubject(selectedSubject, 50);
    setQuestions(qs);
    setCurrentIndex(0);
    setShowAnswer(false);
    setAnswers({ correct: 0, total: 0 });
    setStartTime(Date.now());
    setLoading(false);
  }, [selectedSubject]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQ = questions[currentIndex];

  const submit = async () => {
    if (!currentQ) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const isCorrect = checkAnswer() ? 1 : 0;
    await window.api.answer.record({
      question_id: currentQ.id,
      user_answer: Array.isArray(userAnswer) ? userAnswer.join(',') : userAnswer,
      is_correct: isCorrect,
      time_spent: timeSpent,
    });
    setAnswers((prev) => ({ correct: prev.correct + isCorrect, total: prev.total + 1 }));
    setShowAnswer(true);
    if (isCorrect) {
      await window.api.checkin.record({ completed_minutes: Math.round(timeSpent / 60), question_count: 1 });
    }
  };

  const next = () => {
    setShowAnswer(false);
    setUserAnswer('');
    setStartTime(Date.now());
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      message.success('全部完成！');
      setCurrentIndex(0);
    }
  };

  const checkAnswer = () => {
    if (!currentQ) return false;
    const correct = currentQ.answer.trim();
    const user = Array.isArray(userAnswer) ? userAnswer.join(',').trim() : String(userAnswer).trim();
    return user.toUpperCase() === correct.toUpperCase();
  };

  const renderQuestion = () => {
    if (!currentQ) return <p>没有题目，请先在题库中添加</p>;
    const opts = currentQ.options ? JSON.parse(currentQ.options) : null;

    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tag color="blue">{currentQ.type === 'single_choice' ? '单选题' : currentQ.type === 'multi_choice' ? '多选题' : currentQ.type === 'true_false' ? '判断题' : '填空题'}</Tag>
          <Tag>难度：{'⭐'.repeat(currentQ.difficulty)}</Tag>
          {currentQ.tags && <Tag color="green">{currentQ.tags}</Tag>}
        </div>
        <div style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.8 }}>
          {currentIndex + 1}. {currentQ.content}
        </div>

        {currentQ.type === 'single_choice' && opts && (
          <Radio.Group value={userAnswer as string} onChange={(e) => setUserAnswer(e.target.value)} style={{ width: '100%' }}>
            {opts.map((opt: string, i: number) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <Radio key={i} value={letter} style={{ display: 'block', marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: showAnswer ? (letter === currentQ.answer.trim() ? '#f6ffed' : userAnswer === letter ? '#fff2f0' : '#fafafa') : '#fafafa' }}>
                  {opt}
                </Radio>
              );
            })}
          </Radio.Group>
        )}

        {currentQ.type === 'multi_choice' && opts && (
          <Checkbox.Group value={userAnswer as string[]} onChange={(v) => setUserAnswer(v as string[])} style={{ width: '100%' }}>
            {opts.map((opt: string, i: number) => {
              const letter = String.fromCharCode(65 + i);
              return (
                <Checkbox key={i} value={letter} style={{ display: 'block', marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: '#fafafa' }}>
                  {opt}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        )}

        {currentQ.type === 'true_false' && (
          <Radio.Group value={userAnswer as string} onChange={(e) => setUserAnswer(e.target.value)}>
            <Radio value="正确" style={{ marginRight: 24 }}>正确</Radio>
            <Radio value="错误">错误</Radio>
          </Radio.Group>
        )}

        {currentQ.type === 'fill_blank' && (
          <Input.TextArea rows={2} value={userAnswer as string} onChange={(e) => setUserAnswer(e.target.value)} placeholder="请输入答案" />
        )}

        {currentQ.type === 'code' && (
          <Input.TextArea rows={8} value={userAnswer as string} onChange={(e) => setUserAnswer(e.target.value)} placeholder="请输入代码" style={{ fontFamily: 'monospace' }} />
        )}

        {showAnswer && (
          <div style={{ marginTop: 24, padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <p><strong>正确答案：</strong>{currentQ.answer}</p>
            {currentQ.explanation && <p><strong>解析：</strong>{currentQ.explanation}</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>刷题练习</h2>
        <p>选择题库，开始练习</p>
      </div>
      <Row gutter={16}>
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
          <Progress
            percent={questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0}
            format={() => `${currentIndex + 1}/${questions.length}`}
          />
          <span style={{ marginLeft: 16 }}>
            正确率：{answers.total > 0 ? Math.round((answers.correct / answers.total) * 100) : 0}%
          </span>
        </Col>
      </Row>
      <Card style={{ marginTop: 16 }}>
        {renderQuestion()}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          {!showAnswer ? (
            <Button type="primary" disabled={!userAnswer} onClick={submit}>提交</Button>
          ) : (
            <Button type="primary" icon={<RightOutlined />} onClick={next}>
              {currentIndex < questions.length - 1 ? '下一题' : '完成'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PracticePage;