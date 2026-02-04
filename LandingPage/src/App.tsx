import Landing from './Pages/Landing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LayoutFrame from './components/LayoutFrame';

function App() {
  return (
    <div className='bg-[#0a0a0b] min-h-screen relative text-white antialiased selection:bg-purple-500/30 font-sans'>
      <LayoutFrame />
      <Navbar />
      <Landing />
      <Footer />
    </div>
  );
}

export default App;