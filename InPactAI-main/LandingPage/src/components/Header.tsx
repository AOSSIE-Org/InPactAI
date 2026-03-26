import { motion } from 'framer-motion';
import Github from './github';

const Header = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full z-50 sticky top-0 backdrop-blur-md bg-white/10 border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          
          <span className="text-2xl font-bold text-white">InpactAI</span>
        </motion.div>

        <div className="flex items-center mr-4">
            <Github />
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
