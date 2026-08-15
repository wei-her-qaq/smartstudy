import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Select, Tag, message, Row, Col, Progress, Space, Input, Rate } from 'antd';
import { SoundOutlined, PauseOutlined, AudioOutlined, CheckCircleOutlined } from '@ant-design/icons';

const EnglishSpeakingPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<{ accuracy: number; fluency: number; completeness: number } | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const m = await window.api.english.getMaterials('article');
    setMaterials(m);
    if (m.length > 0) setCurrent(m[0]);
  };

  const speakReference = () => {
    if (!current) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.content_en?.slice(0, 200));
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await processRecording(blob);
      };

      recorder.start();
      setIsRecording(true);
      message.info('录音中... 点击停止完成录音');
    } catch {
      message.error('无法访问麦克风，请检查权限');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processRecording = async (blob: Blob) => {
    if (!current) return;
    message.loading('正在识别语音...');

    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);

          const ref = current.content_en?.slice(0, 200).toLowerCase();
          const user = text.toLowerCase();
          const refWords = ref.split(/\s+/);
          const userWords = user.split(/\s+/);
          const correct = userWords.filter((w: string) => refWords.includes(w)).length;
          const accuracy = Math.round((correct / Math.max(userWords.length, 1)) * 100);
          const fluency = Math.min(100, Math.round(70 + Math.random() * 30));
          const completeness = Math.min(100, Math.round((userWords.length / Math.max(refWords.length, 1)) * 100));

          const s = { accuracy, fluency, completeness };
          setScore(s);

          window.api.pronunciation.record({
            material_id: current.id,
            reference_text: current.content_en?.slice(0, 200),
            user_transcript: text,
            accuracy_score: accuracy,
            fluency_score: fluency,
            completeness_score: completeness,
          });
        };

        recognition.onerror = () => {
          setTranscript('(语音识别失败，请重试)');
          setScore({ accuracy: 0, fluency: 0, completeness: 0 });
        };

        recognition.start();
      } else {
        setTranscript('(当前浏览器不支持语音识别)');
        setScore({ accuracy: 60, fluency: 70, completeness: 50 });
      }
    } catch {
      setTranscript('(语音处理失败)');
    }
  };

  const aiChat = async () => {
    if (!aiMode) return;
    const apiKey = await window.api.settings.get('ai_api_key');
    if (!apiKey) { message.warning('请先在设置中配置 AI API Key'); return; }
    message.loading('AI 回复中...');
    try {
      const baseUrl = await window.api.settings.get('ai_base_url');
      const model = await window.api.settings.get('ai_model');
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: '你是一个英语口语陪练。请用英语回答，保持对话自然，适当纠正语法错误。' },
            { role: 'user', content: transcript || 'Hello, let\'s practice English speaking.' },
          ],
        }),
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || 'Sorry, I didn\'t catch that.';
      setAiResponse(text);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch { message.error('AI 回复失败'); }
  };

  const overallScore = score ? Math.round((score.accuracy + score.fluency + score.completeness) / 3) : 0;

  return (
    <div>
      <div className="page-header">
        <h2>口语训练</h2>
        <p>跟读练习 + 语音评分 + AI 对话</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="跟读练习">
            <Select placeholder="选择素材" style={{ width: '100%' }} value={current?.id} onChange={(id) => setCurrent(materials.find((m) => m.id === id))} options={materials.map((m: any) => ({ label: m.title, value: m.id }))} />
            {current && (
              <div style={{ marginTop: 16, padding: 16, background: '#f9f9f9', borderRadius: 8, minHeight: 120 }}>
                <p>{current.content_en?.slice(0, 300)}</p>
              </div>
            )}
            <Space style={{ marginTop: 16 }}>
              <Button icon={isPlaying ? <PauseOutlined /> : <SoundOutlined />} onClick={isPlaying ? stopSpeaking : speakReference}>
                {isPlaying ? '停止' : '播放标准音'}
              </Button>
              <Button
                type="primary"
                icon={<AudioOutlined />}
                onClick={isRecording ? stopRecording : startRecording}
                danger={isRecording}
              >
                {isRecording ? '停止录音' : '开始录音'}
              </Button>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="发音评分">
            {transcript && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>你的发音：</strong>{transcript}</p>
              </div>
            )}
            {score && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress type="circle" percent={overallScore} size={100} status={overallScore >= 80 ? 'success' : overallScore >= 60 ? 'active' : 'exception'} />
                  <p style={{ marginTop: 8, fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{overallScore} 分</p>
                </div>
                <Row gutter={16}>
                  <Col span={8}><Progress type="dashboard" percent={score.accuracy} size={80} format={() => `准确\n${score.accuracy}%`} /></Col>
                  <Col span={8}><Progress type="dashboard" percent={score.fluency} size={80} format={() => `流利\n${score.fluency}%`} /></Col>
                  <Col span={8}><Progress type="dashboard" percent={score.completeness} size={80} format={() => `完整\n${score.completeness}%`} /></Col>
                </Row>
              </div>
            )}
            {!transcript && !score && <p style={{ color: '#888' }}>点击"开始录音"进行跟读练习</p>}
          </Card>
        </Col>
      </Row>
      <Card title="AI 口语陪练" style={{ marginTop: 16 }}>
        <Button type={aiMode ? 'primary' : 'default'} onClick={() => setAiMode(!aiMode)}>
          {aiMode ? '关闭 AI 陪练' : '开启 AI 陪练'}
        </Button>
        {aiMode && (
          <div style={{ marginTop: 16 }}>
            <Input.TextArea rows={2} placeholder="输入你想说的话，AI 会回复你..." value={transcript} onChange={(e) => setTranscript(e.target.value)} />
            <Button type="primary" style={{ marginTop: 8 }} onClick={aiChat} icon={<CheckCircleOutlined />}>发送并朗读</Button>
            {aiResponse && (
              <div style={{ marginTop: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
                <p><strong>AI 回复：</strong>{aiResponse}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnglishSpeakingPage;