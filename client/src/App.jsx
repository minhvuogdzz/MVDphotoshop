import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Services from './pages/Services';
import Showcase from './pages/Showcase';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Projects from './pages/Projects';
import Admin from './pages/Admin';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SideBanners from './components/Promo/SideBanners';
import MobilePopup from './components/Promo/MobilePopup';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <SideBanners />}
      {!isAdmin && <MobilePopup />}
      {!isAdmin && <Header />}
      
      <main className={isAdmin ? 'bg-bg-main min-h-screen' : ''}>
        <div key={isAdmin ? 'admin' : location.pathname} className={!isAdmin ? 'page-enter-transition' : ''}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/services" element={<Services />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      
      {!isAdmin && <Footer />}
    </>
  );
}

export default App;


