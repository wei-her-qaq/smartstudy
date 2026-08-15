import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Progress, message, Space, List } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';

const AVAILABLE_PACKS = [
  { id: 'english', name: '英语素材包', description: '500篇双语阅读素材，覆盖初中到雅思全部7个级别', size: '2MB', items: 500 },
  { id: 'k12', name: 'K12知识包', description: '3000+条知识点，语文/数学/英语/物理/化学/生物/政治/历史/地理全覆盖', size: '3MB', items: 3000 },
  { id: 'life', name: '生活常识包', description: '500条生活常识，健康/安全/理财/法律/饮食/环保/出行/科技8大分类', size: '1MB', items: 500 },
  { id: 'cert', name: '证书知识包', description: '1000条证书考试知识点，含驾照/计算机/教资/会计/二建', size: '2MB', items: 1000 },
  { id: 'questions', name: '题目包', description: '5000+道练习题，各科目难度分级，含答案和解析', size: '5MB', items: 5000 },
];

const PackManagerPage: React.FC = () => {
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState<string | null>(null);

  const refreshStatus = async () => {
    const packs = await window.api.pack.getDownloaded();
    setDownloaded(packs);
  };

  useEffect(() => { refreshStatus(); }, []);

  const handleDownload = async (packId: string) => {
    setDownloading(packId);
    setProgress(0);
    try {
      await window.api.pack.download(packId, (p: number) => setProgress(p));
      setProgress(100);
      await refreshStatus();
      message.success('下载完成');
    } catch (e: any) {
      message.error('下载失败: ' + (e.message || '网络错误'));
    }
    setDownloading(null);
  };

  const handleImport = async (packId: string) => {
    setImporting(packId);
    try {
      const count = await window.api.pack.import(packId);
      message.success(`成功导入 ${count} 条数据`);
      await refreshStatus();
    } catch (e: any) {
      message.error('导入失败: ' + (e.message || ''));
    }
    setImporting(null);
  };

  const handleDelete = async (packId: string) => {
    await window.api.pack.delete(packId);
    await refreshStatus();
    message.success('已删除');
  };

  return (
    <div>
      <div className="page-header">
        <h2>素材管理</h2>
        <p>下载扩展素材包，丰富学习内容</p>
      </div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
        dataSource={AVAILABLE_PACKS}
        renderItem={(pack) => {
          const isDownloaded = downloaded.includes(pack.id);
          const isDownloading = downloading === pack.id;
          const isImporting = importing === pack.id;
          return (
            <List.Item>
              <Card
                title={pack.name}
                extra={<Tag color={isDownloaded ? 'green' : 'orange'}>{isDownloaded ? '已下载' : '未下载'}</Tag>}
                actions={[
                  isDownloaded ? (
                    <Space>
                      <Button size="small" type="primary" loading={isImporting} onClick={() => handleImport(pack.id)}>导入</Button>
                      <Button size="small" danger onClick={() => handleDelete(pack.id)}>删除</Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      loading={isDownloading}
                      onClick={() => handleDownload(pack.id)}
                    >下载</Button>
                  ),
                ]}
              >
                <p style={{ color: '#666', minHeight: 40 }}>{pack.description}</p>
                <Space>
                  <span style={{ color: '#888', fontSize: 13 }}>{pack.items} 条</span>
                  <span style={{ color: '#888', fontSize: 13 }}>|</span>
                  <span style={{ color: '#888', fontSize: 13 }}>{pack.size}</span>
                </Space>
                {isDownloading && <Progress percent={progress} size="small" style={{ marginTop: 8 }} />}
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default PackManagerPage;