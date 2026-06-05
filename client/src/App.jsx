import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Projects from './pages/Projects';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PetalsEffect from './components/common/PetalsEffect';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </main>
      <Footer />
      {isHome && <PetalsEffect />}
    </>
  );
}

export default App;
