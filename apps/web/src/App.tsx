import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MySessionsPage from './pages/Sessions/MySessionsPage';
import BookSessionPage from './pages/Booking/BookSessionPage';
import AllTutorsPage from './pages/Tutors/AllTutorsPage';
import TutorDetailsPage from './pages/Tutors/TutorDetailsPage';
import EYResourcePage from './pages/Resources/EYResourcePage';
import CurriculumPage from './pages/Curriculum/CurriculumPage';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ReferralPage from './pages/Referral/ReferralPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import FAQPage from './pages/FAQ/FAQPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('speakoo_user');
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mySession" element={<MySessionsPage />} />
          <Route path="/myClass" element={<BookSessionPage />} />
          <Route path="/allTutors" element={<AllTutorsPage />} />
          <Route path="/TutorDetailsView/:id" element={<TutorDetailsPage />} />
          <Route path="/ey-resource" element={<EYResourcePage />} />
          <Route path="/Curriculum" element={<CurriculumPage />} />
          <Route path="/chooseSubscription" element={<SubscriptionPage />} />
          <Route path="/myProfile" element={<ProfilePage />} />
          <Route path="/reffer_earn" element={<ReferralPage />} />
          <Route path="/Leaderboard" element={<LeaderboardPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
