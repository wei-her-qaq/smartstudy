import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Layout style={{ height: '100vh', background: '#f5f5f5' }}>
      <TitleBar />
      <Layout>
        <Sidebar />
        <Content style={{ marginTop: 32, padding: 24, overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tomato" element={<TomatoPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/question-bank" element={<QuestionBankPage />} />
            <Route path="/practice/:subjectId?" element={<PracticePage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/solution" element={<SolutionPage />} />
            <Route path="/english" element={<EnglishPage />} />
            <Route path="/english/reading" element={<EnglishReadingPage />} />
            <Route path="/english/listening" element={<EnglishListeningPage />} />
            <Route path="/english/speaking" element={<EnglishSpeakingPage />} />
            <Route path="/k12" element={<K12Page />} />
            <Route path="/life-tips" element={<LifeTipsPage />} />
            <Route path="/cert" element={<CertPage />} />
            <Route path="/pack-manager" element={<PackManagerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;