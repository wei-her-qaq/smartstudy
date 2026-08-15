import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Tag, Typography, Collapse, Progress, message } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const certTypes = [
  { label: '驾照', value: 'driving' },
  { label: '计算机等级', value: 'computer' },
  { label: '教师资格证', value: 'teacher' },
  { label: '会计初级', value: 'accounting' },
  { label: '二级建造师', value: 'builder' },
  { label: '其他', value: 'other' },
];

const CertPage: React.FC = () => {
  const [certType, setCertType] = useState<string>('driving');
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [certNames, setCertNames] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState<string | undefined>(undefined);

  useEffect(() => {
    window.api.cert.getByType(certType).then((names) => {
      setCertNames(names.map((n: any) => n.cert_name));
      if (names.length > 0) setSelectedCert(names[0].cert_name);
    });
  }, [certType]);

  useEffect(() => {
    window.api.cert.getAll(certType).then((k) => setKnowledge(k));
  }, [certType]);

  const chapters = [...new Set(knowledge.filter((k) => !selectedCert || k.cert_name === selectedCert).map((k) => k.chapter_name))];

  const downloadOffline = () => {
    message.success('已下载离线学习包');
  };

  return (
    <div>
      <div className="page-header">
        <h2>技能证书</h2>
        <p>驾照 · 计算机 · 教资 · 会计 · 二建</p>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          {certTypes.map((c) => (
            <Card
              key={c.value}
              size="small"
              className="card-hover"
              style={{ marginBottom: 8, textAlign: 'center', background: certType === c.value ? '#e6f4ff' : '#fff' }}
              onClick={() => setCertType(c.value)}
            >
              {c.label}
            </Card>
          ))}
        </Col>
        <Col span={20}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Select
                style={{ width: '100%' }}
                placeholder="选择证书"
                value={selectedCert}
                onChange={setSelectedCert}
                options={certNames.map((n) => ({ label: n, value: n }))}
              />
            </Col>
            <Col span={12}>
              <Card
                size="small"
                className="card-hover"
                onClick={downloadOffline}
                style={{ textAlign: 'center', color: '#1677ff' }}
              >
                <DownloadOutlined /> 下载离线学习包
              </Card>
            </Col>
          </Row>
          {chapters.map((chapter) => {
            const items = knowledge.filter((k) => k.chapter_name === chapter && (!selectedCert || k.cert_name === selectedCert));
            return (
              <Card key={chapter} title={chapter as string} style={{ marginBottom: 16 }}>
                {items.map((item) => (
                  <Card key={item.id} size="small" style={{ marginBottom: 8 }} type="inner">
                    <Paragraph>{item.content}</Paragraph>
                    {item.key_points && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color="blue">要点</Tag>
                        <Text>{item.key_points}</Text>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Tag>{item.download_status === 'completed' ? <><CheckCircleOutlined /> 已下载</> : '未下载'}</Tag>
                    </div>
                  </Card>
                ))}
              </Card>
            );
          })}
        </Col>
      </Row>
    </div>
  );
};

export default CertPage;