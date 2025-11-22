import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Lenis from '@studio-freight/lenis';
import Landing from '../src/Pages/Landing';
import PrivacyPolicy from './Pages/Privacy';
import TermsOfService from './Pages/Legal';

function App() {
  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.2,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //     smoothWheel: true,
  //   });

  //   function raf(time: number) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        {/* <Route path="*" element={<Landing />} /> */}
      </Routes>
      {/* <Toaster position="top-right" /> */}
    </BrowserRouter>
  );
}

export default App;