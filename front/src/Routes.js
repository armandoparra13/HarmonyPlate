import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import { MatchingPage } from './pages/MatchingPage/MatchingPage';
import CreateProfilePage from './pages/ProfileCreationPage/CreateProfilePage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
      </Routes>
    </Router>
  );
};
