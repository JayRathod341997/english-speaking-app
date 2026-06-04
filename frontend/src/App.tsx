import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Conversation from './pages/Conversation';
import ConversationPractice from './pages/ConversationPractice';
import Conversations from './pages/Conversations';
import DialoguePractice from './pages/DialoguePractice';
import Dialogues from './pages/Dialogues';
import Feedback from './pages/Feedback';
import Flashcards from './pages/Flashcards';
import Grammar from './pages/Grammar';
import GrammarChapter from './pages/GrammarChapter';
import Home from './pages/Home';
import Idioms from './pages/Idioms';
import Progress from './pages/Progress';
import Vocabulary from './pages/Vocabulary';
import VocabularyCategory from './pages/VocabularyCategory';
import VocabularyQuiz from './pages/VocabularyQuiz';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice/:scenarioId" element={<Conversation />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/progress" element={<Progress />} />

        <Route path="/idioms" element={<Idioms />} />

        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/vocabulary/:categoryId" element={<VocabularyCategory />} />
        <Route path="/vocabulary/:categoryId/quiz" element={<VocabularyQuiz />} />

        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversations/:source/:id" element={<ConversationPractice />} />

        <Route path="/dialogues" element={<Dialogues />} />
        <Route path="/dialogues/:id" element={<DialoguePractice />} />

        <Route path="/flashcards" element={<Flashcards />} />

        <Route path="/grammar" element={<Grammar />} />
        <Route path="/grammar/:slug" element={<GrammarChapter />} />
      </Routes>
    </BrowserRouter>
  );
}
