import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import { MatchingPage } from './pages/MatchingPage/MatchingPage';
import CreateProfilePage from './pages/ProfileCreationPage/CreateProfilePage';
import SignUp from './pages/SignUpPage/SignUpPage'
import FoodPage from './pages/FoodPage/FoodPage';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/food" element={<FoodPage />} />
      </Routes>
    </Router>
  );
};
