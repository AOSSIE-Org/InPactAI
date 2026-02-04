import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Pages/Landing';
import Privacy from './Pages/Privacy';
import Legal from './Pages/Legal';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LayoutFrame from './components/LayoutFrame';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className='bg-[#0a0a0b] min-h-screen relative text-white antialiased selection:bg-purple-500/30 font-sans'>
        <LayoutFrame />
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/legal" element={<Legal />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;