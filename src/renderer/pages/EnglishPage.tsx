import React from 'react';
import { Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, SoundOutlined, AudioOutlined, EditOutlined } from '@ant-design/icons';

const levels = [
  { label: '初中', value: 'junior' },
  { label: '高中', value: 'senior' },
  { label: '四级', value: 'cet4' },
  { label: '六级', value: 'cet6' },
  { label: '考研', value: 'postgrad' },
  { label: '托福', value: 'toefl' },
  { label: '雅思', value: 'ielts' },
];

const EnglishPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h2>英语训练</h2>
        <p>从初中到雅思，全面提升英语能力</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="card-hover" onClick={() => navigate('/english/reading')}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <BookOutlined style={{ fontSize: 36, color: '#1677ff' }} />
              <h3 style={{ marginTop: 12 }}>双语阅读</h3>
              <p style={{ color: '#888' }}>诗歌·小说·期刊</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-hover" onClick={() => navigate('/english/listening')}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <SoundOutlined style={{ fontSize: 36, color: '#52c41a' }} />
              <h3 style={{ marginTop: 12 }}>听力训练</h3>
              <p style={{ color: '#888' }}>分级听力·理解题</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-hover" onClick={() => navigate('/english/speaking')}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <AudioOutlined style={{ fontSize: 36, color: '#faad14' }} />
              <h3 style={{ marginTop: 12 }}>口语训练</h3>
              <p style={{ color: '#888' }}>跟读·评分·AI对话</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-hover" onClick={() => navigate('/practice')}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <EditOutlined style={{ fontSize: 36, color: '#ff4d4f' }} />
              <h3 style={{ marginTop: 12 }}>写作练习</h3>
              <p style={{ color: '#888' }}>作文·批改·评分</p>
            </div>
          </Card>
        </Col>
      </Row>
      <Card title="分级体系" style={{ marginTop: 16 }}>
        <Row gutter={[12, 12]}>
          {levels.map((level) => (
            <Col key={level.value}>
              <Card size="small" className="card-hover" onClick={() => {
                window.api.english.getMaterials(undefined, level.value).then((materials) => {
                  if (materials.length > 0) navigate('/english/reading');
                });
              }}>{level.label}</Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default EnglishPage;