import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Tag, message, Row, Col, Input, Space } from 'antd';
import { SoundOutlined, PauseOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';

const EnglishReadingPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [isReading, setIsReading] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);

  useEffect(() => {
    loadMaterials();
  }, [level, type]);

  const loadMaterials = async () => {
    const m = await window.api.english.getMaterials(type, level);
    setMaterials(m);
    if (m.length > 0) setCurrent(m[0]);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.onend = () => setIsReading(false);
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  const speakSentence = (sentence: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>双语阅读</h2>
        <p>诗歌·小说·期刊 · 中英对照</p>
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
          <Select placeholder="类型" allowClear style={{ width: '100%' }} value={type} onChange={setType} options={[
            { label: '诗歌', value: 'poem' }, { label: '小说', value: 'novel' },
            { label: '文章', value: 'article' }, { label: '散文', value: 'essay' }, { label: '新闻', value: 'news' },
          ]} />
        </Col>
        <Col span={6}>
          <Select placeholder="选择文章" style={{ width: '100%' }} value={current?.id} onChange={(id) => setCurrent(materials.find((m) => m.id === id))} options={materials.map((m: any) => ({ label: m.title, value: m.id }))} />
        </Col>
        <Col span={6}>
          <Space>
            <Button icon={isReading ? <PauseOutlined /> : <SoundOutlined />} onClick={() => isReading ? stopSpeaking() : current && speak(current.content_en)}>
              {isReading ? '停止' : '朗读'}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => message.info('已下载到本地')}>下载</Button>
          </Space>
        </Col>
      </Row>
      {current && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h3>{current.title}</h3>
            {current.author && <p style={{ color: '#888' }}>{current.author}</p>}
            <Tag>{current.type}</Tag>
            {current.level && <Tag color="blue">{current.level}</Tag>}
          </div>
          <div className="bilingual-text">
            <div className="en">
              <h4 style={{ color: '#1677ff', marginBottom: 12, fontSize: 13 }}>ENGLISH</h4>
              {current.content_en?.split('\n\n').map((p: string, i: number) => (
                <p key={i} style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => speakSentence(p)} onMouseEnter={(e) => (e.currentTarget.style.color = '#1677ff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}>
                  {p}
                </p>
              ))}
            </div>
            <div className="cn">
              <h4 style={{ color: '#52c41a', marginBottom: 12, fontSize: 13 }}>中文</h4>
              {current.content_cn?.split('\n\n').map((p: string, i: number) => (
                <p key={i} style={{ marginBottom: 8 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnglishReadingPage;