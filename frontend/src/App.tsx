import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TextAnalyzer from './pages/TextAnalyzer';
import ImageAnalyzer from './pages/ImageAnalyzer';
import SimulationLab from './pages/SimulationLab';
import FraudMap from './pages/FraudMap';
import PhishingScanner from './pages/PhishingScanner';
import FileScanner from './pages/FileScanner';
import BreachChecker from './pages/BreachChecker';
import ChatAssistant from './pages/ChatAssistant';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze-text" element={<TextAnalyzer />} />
          <Route path="analyze-image" element={<ImageAnalyzer />} />
          <Route path="scan-url" element={<PhishingScanner />} />
          <Route path="scan-file" element={<FileScanner />} />
          <Route path="check-breach" element={<BreachChecker />} />
          <Route path="chat" element={<ChatAssistant />} />
          <Route path="simulation" element={<SimulationLab />} />
          <Route path="fraud-map" element={<FraudMap />} />
        </Route>
      </Routes>
    </Router>
  );
}
