import { useState } from 'react';
import { Drawer, Button, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import SendButton from "../components/sendbutton";
import WatchlistButton from "../components/watchlist";

const chatbotSteps = {
  initial: {
    question: 'Are you a Brand or a Creator?',
    options: ['Brand', 'Creator'],
  },
  Brand: [
    { question: 'What is your brand name?', type: 'text', key: 'brandName' },
    { question: 'What industry are you in?', type: 'text', key: 'industry' },
    { question: 'What is your monthly ad budget?', type: 'text', key: 'budget' },
    { question: 'Do you work with influencers already?', type: 'text', key: 'influencerExperience' },
    { question: 'What platforms do you use for advertising?', type: 'text', key: 'adPlatforms' },
    { question: 'What is your target audience?', type: 'text', key: 'targetAudience' },
    { question: 'Do you have a campaign in mind already?', type: 'text', key: 'campaignDetails' },
  ],
  Creator: [
    { question: 'What is your name?', type: 'text', key: 'creatorName' },
    { question: 'What is your email?', type: 'text', key: 'email' },
    { question: 'What is your phone number?', type: 'text', key: 'phone' },
    { question: 'Which platform do you use the most?', type: 'text', key: 'platform' },
    { question: 'Provide your social media handle', type: 'text', key: 'socialMedia' },
    { question: 'How many subscribers do you have?', type: 'text', key: 'subscribers' },
    { question: 'How many followers do you have?', type: 'text', key: 'followers' },
    { question: 'What’s your niche or content type?', type: 'text', key: 'niche' },
    { question: 'Are you open to exclusive brand deals?', type: 'text', key: 'exclusiveDeals' },
    { question: 'Do you have a portfolio?', type: 'text', key: 'portfolio' },
  ],
};


export default function ChatbotSidebarForm() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([{ from: 'bot', text: chatbotSteps.initial.question }]);
  const [stepIndex, setStepIndex] = useState(0);
  const [path, setPath] = useState<null | 'Brand' | 'Creator'>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [userInput, setUserInput] = useState('');
  const [completed, setCompleted] = useState(false);

  const FORM_ID = '';
  const formUrl = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;


  const submitToGoogleForm = async () => {
  
    const formBody = new URLSearchParams();
    formBody.append('entry.1234567890', formData.brandName || formData.creatorName); 
    formBody.append('entry.2345678901', formData.industry); 
    formBody.append('entry.3456789012', formData.budget);
    formBody.append('entry.4567890123', formData.influencerExperience);
    formBody.append('entry.5678901234', formData.adPlatforms);
    formBody.append('entry.6789012345', formData.targetAudience);
    formBody.append('entry.7890123456', formData.campaignDetails);
    formBody.append('entry.8901234567', formData.creatorName);
    formBody.append('entry.9012345678', formData.email);
    formBody.append('entry.0123456789', formData.phone);
    formBody.append('entry.1234567890', formData.platform);
    formBody.append('entry.2345678901', formData.socialMedia);
    formBody.append('entry.3456789012', formData.subscribers);
    formBody.append('entry.4567890123', formData.followers);
    formBody.append('entry.5678901234', formData.niche);
    formBody.append('entry.6789012345', formData.exclusiveDeals);
    formBody.append('entry.7890123456', formData.portfolio);

  
    try {
      await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
      console.log("Submitted to Google Form");
    } catch (err) {
      console.error("Failed to submit to Google Form", err);
    }
  };

  const handleOptionClick = (option: 'Brand' | 'Creator') => {
    setChat((prev) => [...prev, { from: 'user', text: option }]);
    setPath(option);
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        { from: 'bot', text: chatbotSteps[option][0].question },
      ]);
      setStepIndex(0);
    }, 500);
  };

  const handleNext = () => {
    const currentStep = chatbotSteps[path!][stepIndex];
    if (!userInput) return;

    setFormData((prev) => ({ ...prev, [currentStep.key]: userInput }));
    setChat((prev) => [...prev, { from: 'user', text: userInput }]);
    setUserInput('');

    if (stepIndex + 1 < chatbotSteps[path!].length) {
      const nextQuestion = chatbotSteps[path!][stepIndex + 1].question;
      setTimeout(() => {
        setChat((prev) => [...prev, { from: 'bot', text: nextQuestion }]);
      }, 500);
      setStepIndex(stepIndex + 1);
    } else {
      setTimeout(() => {
        setChat((prev) => [
          ...prev,
          { from: 'bot', text: 'Thanks for joining the waitlist! 🎉' },
        ]);
        setCompleted(true);
        submitToGoogleForm();
        setTimeout(() => setOpen(false), 2000); // auto close after 2 seconds
      }, 500);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
    setChat([{ from: 'bot', text: chatbotSteps.initial.question }]);
    setStepIndex(0);
    setPath(null);
    setFormData({});
    setUserInput('');
    setCompleted(false);
  };

  return (
    <div className="p-4">
      <div
        onClick={handleDrawerOpen}
        
      >
        <WatchlistButton />
      </div>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
  <div className="w-[400px] h-screen flex flex-col bg-[#1F2937] text-white">
    
    {/* Header */}
    <div className="p-4 border-b border-gray-700 text-lg font-semibold tracking-wide">
      🤖 Automated Chat Form
    </div>

    {/* Chat Body */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
      {chat.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`p-3 rounded-xl max-w-[85%] whitespace-pre-wrap break-words ${
            msg.from === 'bot'
              ? 'bg-gray-700 text-left'
              : 'bg-[#8B5CF6] ml-auto text-right'
          }`}
        >
          {msg.text}
        </motion.div>
      ))}
    </div>

    {/* Input Section */}
    <div className="p-4 border-t border-gray-700">
      {!path ? (
        <div className="flex gap-3">
          {chatbotSteps.initial.options.map((opt) => (
            <Button
              key={opt}
              variant="outlined"
              onClick={() => handleOptionClick(opt as 'Brand' | 'Creator')}
              sx={{
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#8B5CF6',
                  color: '#fff',
                },
              }}
            >
              {opt}
            </Button>
          ))}
        </div>
      ) : !completed && stepIndex < chatbotSteps[path].length ? (
        <div className="flex items-center gap-2">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={completed}
            placeholder="Type your answer..."
            sx={{
              input: { color: '#000' },
              backgroundColor: 'white',
              borderRadius: '8px',
            }}
          />
          <div onClick={handleNext} className="cursor-pointer">
            <SendButton />
          </div>
        </div>
      ) : null}
    </div>
  </div>
</Drawer>

    </div>
  );
}
