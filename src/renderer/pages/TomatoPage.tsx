import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Select, Row, Col, Statistic, Progress, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, SoundOutlined } from '@ant-design/icons';

const WORK_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

const TomatoPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [completed, setCompleted] = useState(0);
  const [stats, setStats] = useState({ total: 0, totalDuration: 0 });
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<string>('');

  useEffect(() => {
    window.api.tomato.getStats(7).then((r) => {
      setStats({ total: r.total?.count || 0, totalDuration: r.total?.total_duration || 0 });
    });
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleComplete = useCallback(async () => {
    if (mode === 'work') {
      const newCompleted = completed + 1;
      setCompleted(newCompleted);
      await window.api.tomato.record({
        duration: WORK_DURATION,
        type: 'work',
        started_at: startTimeRef.current,
        ended_at: new Date().toISOString(),
        completed: 1,
      });
      message.success('番茄钟完成！休息一下吧');
      if (newCompleted % 4 === 0) {
        setMode('long_break');
        setTimeLeft(LONG_BREAK);
      } else {
        setMode('short_break');
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      await window.api.tomato.record({
        duration: mode === 'short_break' ? SHORT_BREAK : LONG_BREAK,
        type: mode,
        started_at: startTimeRef.current,
        ended_at: new Date().toISOString(),
        completed: 1,
      });
      setMode('work');
      setTimeLeft(WORK_DURATION);
    }
  }, [mode, completed]);

  const start = () => {
    startTimeRef.current = new Date().toISOString();
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? WORK_DURATION : mode === 'short_break' ? SHORT_BREAK : LONG_BREAK);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = mode === 'work'
    ? ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100
    : mode === 'short_break'
      ? ((SHORT_BREAK - timeLeft) / SHORT_BREAK) * 100
      : ((LONG_BREAK - timeLeft) / LONG_BREAK) * 100;

  const switchMode = (newMode: 'work' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? WORK_DURATION : newMode === 'short_break' ? SHORT_BREAK : LONG_BREAK);
  };

  return (
    <div>
      <div className="page-header">
        <h2>番茄钟</h2>
        <p>专注学习，高效休息</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ marginBottom: 24 }}>
                <Button type={mode === 'work' ? 'primary' : 'default'} onClick={() => switchMode('work')} style={{ margin: '0 4px' }}>专注</Button>
                <Button type={mode === 'short_break' ? 'primary' : 'default'} onClick={() => switchMode('short_break')} style={{ margin: '0 4px' }}>短休息</Button>
                <Button type={mode === 'long_break' ? 'primary' : 'default'} onClick={() => switchMode('long_break')} style={{ margin: '0 4px' }}>长休息</Button>
              </div>
              <Progress type="circle" percent={Math.round(progress)} size={200} format={() => ''} />
              <div className="timer-display" style={{ marginTop: -160, position: 'relative', zIndex: 1 }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
                {!isRunning ? (
                  <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={start}>开始</Button>
                ) : (
                  <Button size="large" icon={<PauseCircleOutlined />} onClick={pause}>暂停</Button>
                )}
                <Button size="large" icon={<StopOutlined />} onClick={reset}>重置</Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="今日统计">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="完成番茄钟" value={completed} suffix="个" />
              </Col>
              <Col span={8}>
                <Statistic title="专注时长" value={Math.round(stats.totalDuration / 60)} suffix="分钟" />
              </Col>
              <Col span={8}>
                <Statistic title="今日进度" value={completed >= 8 ? 100 : Math.round((completed / 8) * 100)} suffix="%" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TomatoPage;