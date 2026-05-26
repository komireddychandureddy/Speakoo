import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './core/i18n/I18nContext';
import { LocaleProvider } from './core/locale/LocaleContext';
import AppLayout from './components/Layout/AppLayout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MySessionsPage from './pages/Sessions/MySessionsPage';
import BookSessionPage from './pages/Booking/BookSessionPage';
import AllTutorsPage from './pages/Tutors/AllTutorsPage';
import TutorDetailsPage from './pages/Tutors/TutorDetailsPage';
import EYResourcePage from './pages/Resources/EYResourcePage';
import CurriculumPage from './pages/Curriculum/CurriculumPage';
import CreditsPage from './pages/Credits/CreditsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ReferralPage from './pages/Referral/ReferralPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import FAQPage from './pages/FAQ/FAQPage';
import BecomeTutorPage from './pages/BecomeTutor/BecomeTutorPage';
import TutorApplyPage from './pages/BecomeTutor/TutorApplyPage';
import TutorDashboardPage from './pages/TutorDashboard/TutorDashboardPage';
import TutorEarningsPage from './pages/TutorDashboard/TutorEarningsPage';
import TutorSchedulePage from './pages/TutorDashboard/TutorSchedulePage';
import TutorPricingPage from './pages/TutorDashboard/TutorPricingPage';
import TutorPayoutPage from './pages/TutorDashboard/TutorPayoutPage';
import WelcomePage from './pages/Welcome/WelcomePage';
import SpeakingPracticePage from './pages/Practice/SpeakingPracticePage';
import PracticeExercisePage from './pages/Practice/PracticeExercisePage';
import CommunityPage from './pages/Community/CommunityPage';
import CommunityThreadPage from './pages/Community/CommunityThreadPage';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminTutorsPage from './pages/Admin/AdminTutorsPage';
import AdminLearnersPage from './pages/Admin/AdminLearnersPage';
import AdminApplicationsPage from './pages/Admin/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/Admin/AdminApplicationDetailPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('speakoo_user');
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <I18nProvider>
      <LocaleProvider>
        <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/become-a-tutor" element={<BecomeTutorPage />} />
        <Route path="/tutor-apply" element={<TutorApplyPage />} />
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
          <Route path="/chooseSubscription" element={<Navigate to="/my-credits" replace />} />
          <Route path="/my-credits" element={<CreditsPage />} />
          <Route path="/myProfile" element={<ProfilePage />} />
          <Route path="/reffer_earn" element={<ReferralPage />} />
          <Route path="/Leaderboard" element={<LeaderboardPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/tutor-dashboard" element={<TutorDashboardPage />} />
          <Route path="/tutor-earnings" element={<TutorEarningsPage />} />
          <Route path="/tutor-schedule" element={<TutorSchedulePage />} />
          <Route path="/tutor-pricing" element={<TutorPricingPage />} />
          <Route path="/tutor-payout" element={<TutorPayoutPage />} />
          <Route path="/practice" element={<SpeakingPracticePage />} />
          <Route path="/practice/exercise" element={<PracticeExercisePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:id" element={<CommunityThreadPage />} />
        </Route>
        <Route
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tutors" element={<AdminTutorsPage />} />
          <Route path="/admin/learners" element={<AdminLearnersPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
        </Route>
      </Routes>
        </BrowserRouter>
      </LocaleProvider>
    </I18nProvider>
  );
}
