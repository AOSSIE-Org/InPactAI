import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '../src/Pages/Landing';
import PrivacyPolicy from './Pages/Privacy';
import TermsOfService from './Pages/Legal';

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;