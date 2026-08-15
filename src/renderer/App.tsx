import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import TomatoPage from './pages/TomatoPage';
import StudyPlanPage from './pages/StudyPlanPage';
import QuestionBankPage from './pages/QuestionBankPage';
import PracticePage from './pages/PracticePage';
import AnalysisPage from './pages/AnalysisPage';
import SolutionPage from './pages/SolutionPage';
import EnglishPage from './pages/EnglishPage';
import EnglishReadingPage from './pages/EnglishReadingPage';
import EnglishListeningPage from './pages/EnglishListeningPage';
import EnglishSpeakingPage from './pages/EnglishSpeakingPage';
import K12Page from './pages/K12Page';
import LifeTipsPage from './pages/LifeTipsPage';
import CertPage from './pages/CertPage';
import TodoPage from './pages/TodoPage';
import SettingsPage from './pages/SettingsPage';
import PackManagerPage from './pages/PackManagerPage';

const { Content } = Layout;

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter" style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout style={{ height: '100vh', background: 'var(--bg)' }}>
      <TitleBar />
      <Layout style={{ flexDirection: 'row' }}>
        <Sidebar />
        <Content className="content-area">
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/tomato" element={<PageWrapper><TomatoPage /></PageWrapper>} />
            <Route path="/study-plan" element={<PageWrapper><StudyPlanPage /></PageWrapper>} />
            <Route path="/todo" element={<PageWrapper><TodoPage /></PageWrapper>} />
            <Route path="/question-bank" element={<PageWrapper><QuestionBankPage /></PageWrapper>} />
            <Route path="/practice/:subjectId?" element={<PageWrapper><PracticePage /></PageWrapper>} />
            <Route path="/analysis" element={<PageWrapper><AnalysisPage /></PageWrapper>} />
            <Route path="/solution" element={<PageWrapper><SolutionPage /></PageWrapper>} />
            <Route path="/english" element={<PageWrapper><EnglishPage /></PageWrapper>} />
            <Route path="/english/reading" element={<PageWrapper><EnglishReadingPage /></PageWrapper>} />
            <Route path="/english/listening" element={<PageWrapper><EnglishListeningPage /></PageWrapper>} />
            <Route path="/english/speaking" element={<PageWrapper><EnglishSpeakingPage /></PageWrapper>} />
            <Route path="/k12" element={<PageWrapper><K12Page /></PageWrapper>} />
            <Route path="/life-tips" element={<PageWrapper><LifeTipsPage /></PageWrapper>} />
            <Route path="/cert" element={<PageWrapper><CertPage /></PageWrapper>} />
            <Route path="/pack-manager" element={<PageWrapper><PackManagerPage /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;