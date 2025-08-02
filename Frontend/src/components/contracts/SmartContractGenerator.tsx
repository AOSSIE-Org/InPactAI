import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  Loader2,
  Copy,
  Download
} from 'lucide-react';

interface ContractGenerationForm {
  creator_id: string;
  brand_id: string;
  contract_type: string;
  budget_range: string;
  content_type: string[];
  duration_weeks: number;
  requirements: string;
  industry: string;
  exclusivity: string;
  compliance_requirements: string[];
}

interface GeneratedContract {
  contract_title: string;
  contract_type: string;
  total_budget: number;
  start_date: string;
  end_date: string;
  terms_and_conditions: Record<string, any>;
  payment_terms: Record<string, any>;
  deliverables: Record<string, any>;
  legal_compliance: Record<string, any>;
  risk_score: number;
  ai_suggestions: string[];
}

interface SmartContractGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onContractGenerated: (contract: GeneratedContract) => void;
  currentUser?: {
    id: string;
    username: string;
    role: 'creator' | 'brand';
  };
}

const SmartContractGenerator: React.FC<SmartContractGeneratorProps> = ({
  isOpen,
  onClose,
  onContractGenerated,
  currentUser
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null);
  const [formData, setFormData] = useState<ContractGenerationForm>({
    creator_id: currentUser?.role === 'creator' ? currentUser.id : '',
    brand_id: currentUser?.role === 'brand' ? currentUser.id : '',
    contract_type: 'one-time',
    budget_range: 'medium',
    content_type: [],
    duration_weeks: 4,
    requirements: '',
    industry: '',
    exclusivity: 'non-exclusive',
    compliance_requirements: []
  });


  const [availableUsers, setAvailableUsers] = useState<{creators: any[], brands: any[]} | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  // Update form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        creator_id: currentUser.role === 'creator' ? currentUser.id : prev.creator_id,
        brand_id: currentUser.role === 'brand' ? currentUser.id : prev.brand_id
      }));
    }
  }, [currentUser]);

  // Helper function to get username by ID
  const getUsernameById = (id: string) => {
    if (!availableUsers) return '';
    
    const allUsers = [...availableUsers.creators, ...availableUsers.brands];
    const user = allUsers.find(u => u.id === id);
    return user ? user.username : '';
  };

  const contractTypes = [
    { value: 'one-time', label: 'One-Time Project', icon: FileText },
    { value: 'recurring', label: 'Recurring Content', icon: Calendar },
    { value: 'campaign', label: 'Campaign', icon: Sparkles },
    { value: 'sponsorship', label: 'Sponsorship', icon: Users }
  ];

  const budgetRanges = [
    { value: 'low', label: 'Low Budget', range: '$500 - $2,000' },
    { value: 'medium', label: 'Medium Budget', range: '$2,000 - $10,000' },
    { value: 'high', label: 'High Budget', range: '$10,000+' }
  ];

  const contentTypes = [
    { value: 'instagram', label: 'Instagram', icon: '/instagram.png' },
    { value: 'youtube', label: 'YouTube', icon: '/youtube.png' },
    { value: 'tiktok', label: 'TikTok', icon: '/tiktok.png' },
    { value: 'facebook', label: 'Facebook', icon: '/facebook.png' },
    { value: 'twitter', label: 'Twitter', icon: '/twitter.png' },
    { value: 'linkedin', label: 'LinkedIn', icon: '/linkedin.png' },
    { value: 'blog', label: 'Blog', icon: '📝' }
  ];

  const complianceOptions = [
    'FTC Disclosure Required',
    'GDPR Compliance',
    'Data Protection',
    'Intellectual Property Rights',
    'Payment Compliance'
  ];

  const handleInputChange = (field: keyof ContractGenerationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentTypeToggle = (contentType: string) => {
    setFormData(prev => ({
      ...prev,
      content_type: prev.content_type.includes(contentType)
        ? prev.content_type.filter(type => type !== contentType)
        : [...prev.content_type, contentType]
    }));
  };

  const handleComplianceToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      compliance_requirements: prev.compliance_requirements.includes(requirement)
        ? prev.compliance_requirements.filter(req => req !== requirement)
        : [...prev.compliance_requirements, requirement]
    }));
  };

  const handleGenerateContract = async () => {
    if (!formData.creator_id || !formData.brand_id || !formData.requirements) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate ID format (basic check)
    if (!formData.creator_id.trim() || !formData.brand_id.trim()) {
      alert('Please enter valid Creator ID and Brand ID');
      return;
    }

    // Ensure creator and brand are different users
    if (formData.creator_id === formData.brand_id) {
      alert('Creator and Brand must be different users');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/contracts/generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate contract');
      }

      const contract = await response.json();
      setGeneratedContract(contract);
      setStep(3);
    } catch (error) {
      console.error('Error generating contract:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate contract. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContract = () => {
    if (generatedContract) {
      onContractGenerated(generatedContract);
      onClose();
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/contracts/generation/available-users');
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
        setShowUserList(true);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getRelevantUsers = () => {
    if (!availableUsers) return { users: [], title: '', field: '' };
    
    if (currentUser?.role === 'creator') {
      return { 
        users: availableUsers.brands, 
        title: 'Select Brand', 
        field: 'brand_id' 
      };
    } else if (currentUser?.role === 'brand') {
      return { 
        users: availableUsers.creators, 
        title: 'Select Creator', 
        field: 'creator_id' 
      };
    } else {
      // For admin or no role, show both but need to determine which field to update
      return { 
        users: [...availableUsers.creators, ...availableUsers.brands], 
        title: 'Select User', 
        field: 'creator_id' // Default to creator_id, will be overridden in modal
      };
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Creator ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.creator_id}
                onChange={(e) => handleInputChange('creator_id', e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder={currentUser?.role === 'creator' ? `You are the creator (${currentUser.username})` : "Enter creator ID (e.g., u113, u115, u116)"}
                disabled={currentUser?.role === 'creator'}
              />
              {currentUser?.role !== 'creator' && (
                <button
                  type="button"
                  onClick={fetchAvailableUsers}
                  className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="View available creators"
                >
                  👥
                </button>
              )}
            </div>
            {formData.creator_id && getUsernameById(formData.creator_id) && (
              <div className="text-xs text-green-400 mt-1">
                Selected: {getUsernameById(formData.creator_id)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {currentUser?.role === 'creator' 
                ? `You are the creator (${currentUser.username})` 
                : 'Must be a valid creator user ID'
              }
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.brand_id}
                onChange={(e) => handleInputChange('brand_id', e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder={currentUser?.role === 'brand' ? `You are the brand (${currentUser.username})` : "Enter brand ID (e.g., u111, u114)"}
                disabled={currentUser?.role === 'brand'}
              />
              {currentUser?.role !== 'brand' && (
                <button
                  type="button"
                  onClick={fetchAvailableUsers}
                  className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="View available brands"
                >
                  👥
                </button>
              )}
            </div>
            {formData.brand_id && getUsernameById(formData.brand_id) && (
              <div className="text-xs text-green-400 mt-1">
                Selected: {getUsernameById(formData.brand_id)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {currentUser?.role === 'brand' 
                ? `You are the brand (${currentUser.username})` 
                : 'Must be a valid brand user ID'
              }
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Contract Type *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {contractTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => handleInputChange('contract_type', type.value)}
                className={`p-4 rounded-lg border transition-all ${
                  formData.contract_type === type.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Budget Range *
        </label>
        <div className="space-y-2">
          {budgetRanges.map((budget) => (
            <button
              key={budget.value}
              onClick={() => handleInputChange('budget_range', budget.value)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                formData.budget_range === budget.value
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{budget.label}</span>
                <span className="text-sm opacity-75">{budget.range}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
      >
        Continue to Details
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Content & Requirements</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Content Types *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {contentTypes.map((content) => (
              <button
                key={content.value}
                onClick={() => handleContentTypeToggle(content.value)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.content_type.includes(content.value)
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="mb-1 flex justify-center">
                  {content.icon.startsWith('/') ? (
                    <img 
                      src={content.icon} 
                      alt={content.label}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">{content.icon}</span>
                  )}
                </div>
                <div className="text-sm font-medium">{content.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (weeks) *
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={formData.duration_weeks}
              onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value))}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Industry
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Fashion, Tech, Food"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Requirements Description *
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            rows={4}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Describe the project requirements, goals, and any specific needs..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Compliance Requirements
          </label>
          <div className="space-y-2">
            {complianceOptions.map((requirement) => (
              <button
                key={requirement}
                onClick={() => handleComplianceToggle(requirement)}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  formData.compliance_requirements.includes(requirement)
                    ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{requirement}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleGenerateContract}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Contract
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (!generatedContract) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Contract Generated!</h3>
          <p className="text-gray-400">Your AI-powered contract is ready to use.</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">{generatedContract.contract_title}</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Budget:</span>
              <span className="text-sm font-medium text-white">${generatedContract.total_budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Duration:</span>
              <span className="text-sm font-medium text-white">
                {new Date(generatedContract.start_date).toLocaleDateString()} - {new Date(generatedContract.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-300">Risk Score:</span>
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  generatedContract.risk_score < 0.3 ? 'bg-green-500' : 
                  generatedContract.risk_score < 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${generatedContract.risk_score * 100}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${
              generatedContract.risk_score < 0.3 ? 'text-green-400' : 
              generatedContract.risk_score < 0.6 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {(generatedContract.risk_score * 100).toFixed(0)}%
            </span>
          </div>

          {generatedContract.ai_suggestions && generatedContract.ai_suggestions.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">AI Suggestions:</h5>
              <div className="space-y-1">
                {generatedContract.ai_suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Generate Another
          </button>
          <button
            onClick={handleUseContract}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Use This Contract
          </button>
        </div>
      </div>
    );
  };

  const renderUserListModal = () => {
    if (!showUserList || !availableUsers) return null;

    const { users, title, field } = getRelevantUsers();

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={() => setShowUserList(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    // Determine which field to update based on user role
                    const targetField = user.role === 'creator' ? 'creator_id' : 'brand_id';
                    handleInputChange(targetField as 'creator_id' | 'brand_id', user.id);
                    setShowUserList(false);
                  }}
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-left hover:border-blue-500 transition-colors"
                >
                  <div className="text-sm font-medium text-white">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.id}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/brand/dashboard/overview'}
              className="mr-3 p-2.5 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-800/70 border border-gray-700 hover:border-gray-600"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Smart Contract Generator</h3>
              <p className="text-sm text-gray-400">AI-powered contract creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
      {renderUserListModal()}
    </div>
  );
};

export default SmartContractGenerator; 