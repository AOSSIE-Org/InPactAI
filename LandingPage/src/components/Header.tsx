import { motion } from 'framer-motion';
import Github from './github';

const Header = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full z-50 sticky top-0 backdrop-blur-md bg-gradient-to-r from-black/80 via-purple-900/30 to-pink-900/30 border-b border-purple-500/20"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">InpactAI</span>
        </motion.div>

        <div className="flex items-center mr-4">
            <Github />
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
