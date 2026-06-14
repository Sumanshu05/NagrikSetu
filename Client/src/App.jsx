import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './index.css';
import Navbar       from './components/homepage/Navbar';
import Hero         from './components/homepage/Hero';
import HowItWorks   from './components/homepage/HowItWorks';
import Features     from './components/homepage/Features';
import Testimonials from './components/homepage/Testimonials';
import CTASection   from './components/homepage/CTASection';
import Footer       from './components/homepage/Footer';

import Login        from './pages/Login';
import Register     from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import SubmitComplaint    from './pages/SubmitComplaint';
import ComplaintDetail   from './pages/ComplaintDetail';
import Notifications     from './pages/Notifications';
import ContactUs         from './pages/ContactUs';
import OpenRoute from './components/core/Auth/OpenRoute';
import PrivateRoute from './components/core/Auth/PrivateRoute';

const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTASection />
    </>
  );
};

const AppContent = () => {
  const { user } = useSelector((state) => state.profile);
  const location = useLocation();
  const hideLayout = location.pathname === '/dashboard';

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'officer':
        return <OfficerDashboard />;
      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          } />
          <Route path="/register" element={
            <OpenRoute>
              <Register />
            </OpenRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              {renderDashboard()}
            </PrivateRoute>
          } />
          <Route path="/submit-complaint" element={
            <PrivateRoute>
              <SubmitComplaint />
            </PrivateRoute>
          } />
          <Route path="/complaint/:id" element={
            <PrivateRoute>
              <ComplaintDetail />
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </div>
      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
