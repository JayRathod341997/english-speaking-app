import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Conversation from './pages/Conversation';
import Feedback from './pages/Feedback';
import Home from './pages/Home';
import Progress from './pages/Progress';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice/:scenarioId" element={<Conversation />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </BrowserRouter>
  );
}
