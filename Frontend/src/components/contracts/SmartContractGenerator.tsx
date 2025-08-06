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
  min_budget: number;
  max_budget: number;
  content_type: string[];
  duration_weeks: number;
  requirements: string;
  industry: string;
  exclusivity: string;
  compliance_requirements: string[];
  jurisdiction: string;
  dispute_resolution: string;
  custom_jurisdiction?: string;
  custom_dispute_resolution?: string;
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

interface PricingRecommendation {
  recommended_price: number;
  confidence_score: number;
  reasoning: string;
  similar_contracts_used: any[];
  market_factors: Record<string, any>;
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
  const [pricingRecommendation, setPricingRecommendation] = useState<PricingRecommendation | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [formData, setFormData] = useState<ContractGenerationForm>({
    creator_id: currentUser?.role === 'creator' ? currentUser.id : '',
    brand_id: currentUser?.role === 'brand' ? currentUser.id : '',
    contract_type: 'one-time',
    min_budget: 0,
    max_budget: 0,
    content_type: [],
    duration_weeks: 4,
    requirements: '',
    industry: '',
    exclusivity: 'non-exclusive',
    compliance_requirements: [],
    jurisdiction: '',
    dispute_resolution: ''
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

  // Jurisdiction options
  const jurisdictions = [
    { value: "california", label: "California, USA", laws: ["California Civil Code", "Federal Trade Commission Act", "California Consumer Privacy Act"] },
    { value: "newyork", label: "New York, USA", laws: ["New York Civil Practice Law", "Federal Trade Commission Act", "New York Consumer Protection"] },
    { value: "mumbai", label: "Mumbai, India", laws: ["Indian Contract Act, 1872", "Information Technology Act, 2000", "Consumer Protection Act, 2019"] },
    { value: "london", label: "London, UK", laws: ["English Contract Law", "Consumer Rights Act 2015", "Data Protection Act 2018"] },
    { value: "toronto", label: "Toronto, Canada", laws: ["Ontario Consumer Protection Act", "Personal Information Protection Act", "Competition Act"] },
    { value: "singapore", label: "Singapore", laws: ["Singapore Contract Law", "Personal Data Protection Act", "Consumer Protection Act"] },
    { value: "sydney", label: "Sydney, Australia", laws: ["Australian Consumer Law", "Privacy Act 1988", "Competition and Consumer Act"] },
    { value: "custom", label: "Custom Jurisdiction", laws: [] }
  ];

  const disputeResolutionOptions = [
    { value: "arbitration", label: "Binding Arbitration", description: "Disputes resolved through arbitration" },
    { value: "mediation", label: "Mediation", description: "Disputes resolved through mediation first" },
    { value: "court", label: "Court Proceedings", description: "Disputes resolved in local courts" },
    { value: "custom", label: "Custom Resolution", description: "Specify custom dispute resolution" }
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

    // Validate budget range
    if (formData.min_budget <= 0 || formData.max_budget <= 0) {
      alert('Please set valid minimum and maximum budget values');
      return;
    }

    if (formData.min_budget >= formData.max_budget) {
      alert('Maximum budget must be greater than minimum budget');
      return;
    }

    // Validate jurisdiction and dispute resolution
    if (!formData.jurisdiction) {
      alert('Please select a governing jurisdiction');
      return;
    }

    if (!formData.dispute_resolution) {
      alert('Please select a dispute resolution method');
      return;
    }

    // Validate custom fields if selected
    if (formData.jurisdiction === 'custom' && !formData.custom_jurisdiction?.trim()) {
      alert('Please provide details for custom jurisdiction');
      return;
    }

    if (formData.dispute_resolution === 'custom' && !formData.custom_dispute_resolution?.trim()) {
      alert('Please provide details for custom dispute resolution');
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
      setStep(4);
    } catch (error) {
      console.error('Error generating contract:', error);
      let errorMessage = 'Failed to generate contract. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'detail' in error) {
        errorMessage = String(error.detail);
      }
      
      alert(`Error generating contract: ${errorMessage}`);
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

  const getPricingRecommendation = async () => {
    if (!formData.creator_id || !formData.content_type.length) {
      alert('Please select a creator and content type first');
      return;
    }

    setIsLoadingPricing(true);
    try {
      // Get creator details for pricing
      const creatorResponse = await fetch(`http://localhost:8000/api/users/${formData.creator_id}`);
      if (!creatorResponse.ok) {
        throw new Error('Failed to fetch creator details');
      }
      const creatorData = await creatorResponse.json();
      
      const pricingRequest = {
        creator_followers: creatorData.followers_count || 10000, // Default if not available
        creator_engagement_rate: creatorData.engagement_rate || 3.5, // Default if not available
        content_type: formData.content_type[0] || 'video',
        campaign_type: formData.contract_type === 'one-time' ? 'product_launch' : 'ongoing',
        platform: 'youtube', // Default, could be made dynamic
        duration_weeks: formData.duration_weeks,
        exclusivity_level: formData.exclusivity === 'exclusive' ? 'platform' : 'none'
      };

      const response = await fetch('http://localhost:8000/api/pricing/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingRequest),
      });

      if (!response.ok) {
        throw new Error(`Pricing recommendation failed: ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPricingRecommendation(data);
      
      // Calculate min and max budget based on recommendation
      const recommendedPrice = data.recommended_price || 2000;
      const minBudget = Math.max(500, Math.round(recommendedPrice * 0.7)); // 70% of recommended
      const maxBudget = Math.round(recommendedPrice * 1.3); // 130% of recommended
      
      // Update form with AI-recommended budget range
      setFormData(prev => ({
        ...prev,
        min_budget: minBudget,
        max_budget: maxBudget
      }));
      
    } catch (error) {
      console.error('Error getting pricing recommendation:', error);
      alert(`Error getting pricing recommendation: ${error}`);
    } finally {
      setIsLoadingPricing(false);
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

        {/* Jurisdiction and Dispute Resolution */}
        <div className="mt-6 border-t border-gray-700 pt-6">
          <h4 className="text-md font-semibold text-white mb-4">Legal Framework</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Governing Jurisdiction <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select jurisdiction</option>
                {jurisdictions.map((jurisdiction) => (
                  <option key={jurisdiction.value} value={jurisdiction.value}>
                    {jurisdiction.label}
                  </option>
                ))}
              </select>
              {formData.jurisdiction && formData.jurisdiction !== "custom" && (
                <div className="text-xs text-gray-400 mt-2">
                  <p className="font-medium">Applicable Laws:</p>
                  <ul className="list-disc pl-4 mt-1">
                    {jurisdictions.find(j => j.value === formData.jurisdiction)?.laws.map((law, index) => (
                      <li key={index}>{law}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.jurisdiction === "custom" && (
                <div className="text-xs text-blue-400 mt-2">
                  <p className="font-medium">ℹ️ Custom jurisdiction selected. Please provide specific details below.</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dispute Resolution <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.dispute_resolution}
                onChange={(e) => handleInputChange('dispute_resolution', e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select resolution method</option>
                {disputeResolutionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.dispute_resolution === "custom" && (
                <div className="text-xs text-blue-400 mt-2">
                  <p className="font-medium">ℹ️ Custom dispute resolution selected. Please provide specific details below.</p>
                </div>
              )}
            </div>
          </div>

          {formData.jurisdiction === "custom" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Jurisdiction Details
              </label>
              <textarea
                value={formData.custom_jurisdiction || ''}
                onChange={(e) => handleInputChange('custom_jurisdiction', e.target.value)}
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Specify your custom jurisdiction and applicable laws..."
              />
            </div>
          )}

          {formData.dispute_resolution === "custom" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Dispute Resolution
              </label>
              <textarea
                value={formData.custom_dispute_resolution || ''}
                onChange={(e) => handleInputChange('custom_dispute_resolution', e.target.value)}
                rows={3}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Specify your custom dispute resolution procedure..."
              />
            </div>
          )}
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
          onClick={() => setStep(3)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Continue to Pricing
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Budget & Pricing</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Minimum Budget ($)</label>
              <input
                type="number"
                value={formData.min_budget}
                onChange={(e) => handleInputChange('min_budget', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Maximum Budget ($)</label>
              <input
                type="number"
                value={formData.max_budget}
                onChange={(e) => handleInputChange('max_budget', parseInt(e.target.value) || 0)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="5000"
                min="0"
              />
            </div>
          </div>
          
          {/* AI Pricing Recommender */}
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">AI Pricing Assistant</span>
              </div>
              <button
                onClick={getPricingRecommendation}
                disabled={isLoadingPricing || !formData.creator_id || !formData.content_type.length}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
              >
                {isLoadingPricing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3" />
                    Get AI Recommendation
                  </>
                )}
              </button>
            </div>
            
            {pricingRecommendation && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">
                  <strong>Recommended Range:</strong> ${formData.min_budget.toLocaleString()} - ${formData.max_budget.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  <strong>Reasoning:</strong> {pricingRecommendation.reasoning}
                </div>
                {pricingRecommendation.confidence_score > 0 && (
                  <div className="text-xs text-gray-400">
                    <strong>Confidence:</strong> {Math.round(pricingRecommendation.confidence_score * 100)}%
                  </div>
                )}
              </div>
            )}
            
            {!pricingRecommendation && !isLoadingPricing && (
              <div className="text-xs text-gray-500">
                Click "Get AI Recommendation" to get pricing suggestions based on creator data, content type, and market analysis.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleGenerateContract}
          disabled={isGenerating || formData.min_budget <= 0 || formData.max_budget <= 0 || formData.min_budget >= formData.max_budget}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Contract...
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

  const renderStep4 = () => {
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
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
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
          {step === 4 && renderStep4()}
        </div>
      </div>
      {renderUserListModal()}
    </div>
  );
};

export default SmartContractGenerator; 