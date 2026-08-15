import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Tag, message, Row, Col, Radio, Progress, Space } from 'antd';
import { SoundOutlined, PauseOutlined } from '@ant-design/icons';

const EnglishListeningPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [level]);

  const loadMaterials = async () => {
    const m = await window.api.english.getMaterials('article', level);
    setMaterials(m);
    if (m.length > 0) setCurrent(m[0]);
  };

  const play = () => {
    if (!current) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.content_en);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div>
      <div className="page-header">
        <h2>听力训练</h2>
        <p>分级听力素材，提升听力理解</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Select placeholder="分级" allowClear style={{ width: '100%' }} value={level} onChange={setLevel} options={[
            { label: '初中', value: 'junior' }, { label: '高中', value: 'senior' },
            { label: '四级', value: 'cet4' }, { label: '六级', value: 'cet6' },
            { label: '考研', value: 'postgrad' }, { label: '托福', value: 'toefl' }, { label: '雅思', value: 'ielts' },
          ]} />
        </Col>
        <Col span={6}>
          <Select placeholder="选择素材" style={{ width: '100%' }} value={current?.id} onChange={(id) => setCurrent(materials.find((m) => m.id === id))} options={materials.map((m: any) => ({ label: m.title, value: m.id }))} />
        </Col>
        <Col span={6}>
          <Space>
            <Button type="primary" icon={isPlaying ? <PauseOutlined /> : <SoundOutlined />} onClick={isPlaying ? stop : play}>
              {isPlaying ? '停止' : '播放'}
            </Button>
            <Button onClick={() => setShowTranscript(!showTranscript)}>{showTranscript ? '隐藏' : '显示'}原文</Button>
          </Space>
        </Col>
        <Col span={6}>
          <Radio.Group value={speechRate} onChange={(e) => setSpeechRate(e.target.value)}>
            <Radio.Button value={0.6}>0.6x</Radio.Button>
            <Radio.Button value={0.8}>0.8x</Radio.Button>
            <Radio.Button value={1.0}>1.0x</Radio.Button>
            <Radio.Button value={1.25}>1.25x</Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
      {current && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h3>{current.title}</h3>
            <Tag color="blue">{current.level}</Tag>
          </div>
          {isPlaying && <Progress percent={100} status="active" showInfo={false} style={{ marginBottom: 16 }} />}
          {showTranscript && (
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, maxHeight: 400, overflow: 'auto' }}>
              <div className="bilingual-text">
                <div className="en">
                  <h4 style={{ color: '#1677ff', marginBottom: 8 }}>ENGLISH</h4>
                  {current.content_en?.split('\n\n').map((p: string, i: number) => <p key={i} style={{ marginBottom: 8, lineHeight: 1.8 }}>{p}</p>)}
                </div>
                <div className="cn">
                  <h4 style={{ color: '#52c41a', marginBottom: 8 }}>中文</h4>
                  {current.content_cn?.split('\n\n').map((p: string, i: number) => <p key={i} style={{ marginBottom: 8, lineHeight: 1.8 }}>{p}</p>)}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default EnglishListeningPage;