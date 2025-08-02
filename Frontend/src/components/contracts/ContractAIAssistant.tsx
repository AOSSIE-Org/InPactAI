import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  analysis?: any;
  suggestions?: string[];
}

interface ContractAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContractId?: string;
}

const ContractAIAssistant: React.FC<ContractAIAssistantProps> = ({
  isOpen,
  onClose,
  selectedContractId
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Contract Assistant. I can help you analyze contracts, provide insights, and answer questions about your contract portfolio. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/contracts/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          contract_id: selectedContractId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        analysis: data.analysis,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderAnalysis = (analysis: any) => {
    if (!analysis) return null;

    return (
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Contract Analysis</h4>
        
        {/* Risk Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Risk Score</span>
            <span className={`text-xs font-medium ${
              analysis.risk_score < 0.3 ? 'text-green-400' : 
              analysis.risk_score < 0.6 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {(analysis.risk_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                analysis.risk_score < 0.3 ? 'bg-green-500' : 
                analysis.risk_score < 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analysis.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Factors */}
        {analysis.risk_factors && analysis.risk_factors.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-400 block mb-2">Risk Factors</span>
            <div className="flex flex-wrap gap-1">
              {analysis.risk_factors.map((factor: string, index: number) => (
                <span key={index} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-gray-400 block mb-2">Recommendations</span>
            <div className="space-y-1">
              {analysis.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Prediction */}
        <div className="mb-3">
          <span className="text-xs text-gray-400 block mb-1">Performance Prediction</span>
          <span className="text-xs font-medium text-blue-400">
            {analysis.performance_prediction}
          </span>
        </div>

        {/* Market Comparison */}
        {analysis.market_comparison && (
          <div>
            <span className="text-xs text-gray-400 block mb-2">Market Comparison</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Similar Contracts:</span>
                <span className="text-gray-300 ml-1">{analysis.market_comparison.similar_contracts_count}</span>
              </div>
              <div>
                <span className="text-gray-400">Budget Percentile:</span>
                <span className={`ml-1 ${
                  analysis.market_comparison.budget_percentile === 'above_average' 
                    ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {analysis.market_comparison.budget_percentile.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSuggestions = (suggestions: string[]) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mt-3">
        <span className="text-xs text-gray-400 block mb-2">Quick Actions</span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full hover:bg-blue-500/30 transition-colors"
              onClick={() => setInputValue(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800 w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Contract Assistant</h3>
              <p className="text-sm text-gray-400">
                {selectedContractId ? `Analyzing Contract: ${selectedContractId}` : 'General Contract Analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800/50 text-gray-100'
              } rounded-2xl px-4 py-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.type === 'ai' && message.analysis && renderAnalysis(message.analysis)}
                {message.type === 'ai' && message.suggestions && renderSuggestions(message.suggestions)}
                
                <span className="text-xs text-gray-400 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-800/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your contracts, request analysis, or get insights..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quick Prompts */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Analyze my contracts for risks",
              "Show me high-value contracts",
              "Compare contract performance",
              "Suggest improvements"
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputValue(prompt)}
                className="text-xs bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractAIAssistant; 