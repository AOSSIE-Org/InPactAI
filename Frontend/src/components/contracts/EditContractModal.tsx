import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Trash2 } from 'lucide-react';
import { contractsApi, Contract } from '../../services/contractsApi';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onContractUpdated: (contract: Contract) => void;
  onContractDeleted: (contractId: string) => void;
}

const EditContractModal: React.FC<EditContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  onContractUpdated,
  onContractDeleted
}) => {
  const [formData, setFormData] = useState({
    contract_title: '',
    contract_type: 'one-time',
    total_budget: '',
    start_date: '',
    end_date: '',
    status: 'draft'
  });

  // Separate state for structured data
  const [termsData, setTermsData] = useState({
    content_guidelines: '',
    disclosure_requirements: '',
    brand_guidelines: '',
    usage_rights: '',
    exclusivity: '',
    additional_terms: ''
  });

  const [paymentData, setPaymentData] = useState({
    payment_schedule: '',
    late_fees: '',
    payment_method: '',
    currency: 'USD',
    advance_payment: '',
    final_payment: ''
  });

  const [deliverablesData, setDeliverablesData] = useState({
    content_type: '',
    quantity: '',
    format: '',
    specifications: '',
    timeline: '',
    revision_policy: ''
  });

  // Jurisdiction and dispute resolution data
  const [jurisdictionData, setJurisdictionData] = useState({
    jurisdiction: '',
    dispute_resolution: '',
    custom_jurisdiction: '',
    custom_dispute_resolution: ''
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Populate form when contract changes
  useEffect(() => {
    if (contract) {
      setFormData({
        contract_title: contract.contract_title || '',
        contract_type: contract.contract_type || 'one-time',
        total_budget: contract.total_budget?.toString() || '',
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        status: contract.status || 'draft'
      });

      // Populate terms data
      if (contract.terms_and_conditions && typeof contract.terms_and_conditions === 'object') {
        setTermsData({
          content_guidelines: contract.terms_and_conditions.content_guidelines || '',
          disclosure_requirements: contract.terms_and_conditions.disclosure_requirements || '',
          brand_guidelines: contract.terms_and_conditions.brand_guidelines || '',
          usage_rights: contract.terms_and_conditions.usage_rights || '',
          exclusivity: contract.terms_and_conditions.exclusivity || '',
          additional_terms: contract.terms_and_conditions.additional_terms || ''
        });
      }

      // Populate payment data
      if (contract.payment_terms && typeof contract.payment_terms === 'object') {
        setPaymentData({
          payment_schedule: contract.payment_terms.payment_schedule || '',
          late_fees: contract.payment_terms.late_fees || '',
          payment_method: contract.payment_terms.payment_method || '',
          currency: contract.payment_terms.currency || 'USD',
          advance_payment: contract.payment_terms.advance_payment || '',
          final_payment: contract.payment_terms.final_payment || ''
        });
      }

      // Populate deliverables data
      if (contract.deliverables && typeof contract.deliverables === 'object') {
        setDeliverablesData({
          content_type: contract.deliverables.content_type || '',
          quantity: contract.deliverables.quantity || '',
          format: contract.deliverables.format || '',
          specifications: contract.deliverables.specifications || '',
          timeline: contract.deliverables.timeline || '',
          revision_policy: contract.deliverables.revision_policy || ''
        });
      }

      // Populate jurisdiction data
      if (contract.terms_and_conditions && typeof contract.terms_and_conditions === 'object') {
        setJurisdictionData({
          jurisdiction: contract.terms_and_conditions.jurisdiction || '',
          dispute_resolution: contract.terms_and_conditions.dispute_resolution || '',
          custom_jurisdiction: contract.terms_and_conditions.custom_jurisdiction || '',
          custom_dispute_resolution: contract.terms_and_conditions.custom_dispute_resolution || ''
        });
      }
    }
  }, [contract]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTermsChange = (field: string, value: string) => {
    setTermsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliverablesChange = (field: string, value: string) => {
    setDeliverablesData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleJurisdictionChange = (field: string, value: string) => {
    setJurisdictionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;

    setLoading(true);
    setError(null);

    try {
      // Filter out empty values from structured data
      const cleanTermsData = Object.fromEntries(
        Object.entries(termsData).filter(([_, value]) => value.trim() !== '')
      );
      
      const cleanPaymentData = Object.fromEntries(
        Object.entries(paymentData).filter(([_, value]) => value.trim() !== '')
      );
      
      const cleanDeliverablesData = Object.fromEntries(
        Object.entries(deliverablesData).filter(([_, value]) => value.trim() !== '')
      );

      const cleanJurisdictionData = Object.fromEntries(
        Object.entries(jurisdictionData).filter(([_, value]) => value && value.trim() !== '')
      );

      // Only include terms_and_conditions if there's actual data
      let termsAndConditions = undefined;
      if (Object.keys(cleanTermsData).length > 0 || Object.keys(cleanJurisdictionData).length > 0) {
        termsAndConditions = { ...cleanTermsData, ...cleanJurisdictionData };
      }

      const updateData = {
        ...formData,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : undefined,
        terms_and_conditions: termsAndConditions,
        payment_terms: Object.keys(cleanPaymentData).length > 0 ? cleanPaymentData : undefined,
        deliverables: Object.keys(cleanDeliverablesData).length > 0 ? cleanDeliverablesData : undefined,
      };

      // Remove undefined values to avoid issues
      const finalUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
      );

      // Additional validation to ensure data is properly formatted
      if (finalUpdateData.terms_and_conditions) {
        // Remove empty strings from terms_and_conditions
        finalUpdateData.terms_and_conditions = Object.fromEntries(
          Object.entries(finalUpdateData.terms_and_conditions).filter(([_, value]) => 
            value !== undefined && value !== null && value !== ''
          )
        );
      }

      // Ensure total_budget is a number if present
      if (finalUpdateData.total_budget !== undefined) {
        finalUpdateData.total_budget = Number(finalUpdateData.total_budget);
        if (isNaN(finalUpdateData.total_budget)) {
          delete finalUpdateData.total_budget;
        }
      }

      console.log('Updating contract with data:', finalUpdateData);
      console.log('Jurisdiction data:', cleanJurisdictionData);
      console.log('Terms and conditions:', termsAndConditions);
      console.log('JSON stringified data:', JSON.stringify(finalUpdateData, null, 2));

      const updatedContract = await contractsApi.updateContract(contract.id, finalUpdateData);
      onContractUpdated(updatedContract);
      onClose();
    } catch (err) {
      console.error('Error updating contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to update contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;

    if (!window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      await contractsApi.deleteContract(contract.id);
      onContractDeleted(contract.id);
      onClose();
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete contract');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(42, 42, 42, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
              Edit Contract
            </h2>
            <p style={{ fontSize: '14px', color: '#a0a0a0' }}>
              ID: {contract.id.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0a0a0',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Contract Info */}
        <div style={{
          background: 'rgba(42, 42, 42, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Creator ID:</span>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{contract.creator_id}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Brand ID:</span>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{contract.brand_id}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Created:</span>
              <div style={{ fontSize: '14px' }}>{new Date(contract.created_at).toLocaleDateString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#a0a0a0' }}>Last Updated:</span>
              <div style={{ fontSize: '14px' }}>{contract.updated_at ? new Date(contract.updated_at).toLocaleDateString() : 'Never'}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Contract Title
              </label>
              <input
                type="text"
                name="contract_title"
                value={formData.contract_title}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder="Enter contract title"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="signed">Signed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Contract Type
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="one-time">One-time</option>
                <option value="ongoing">Ongoing</option>
                <option value="performance-based">Performance-based</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Total Budget
              </label>
              <input
                type="number"
                name="total_budget"
                value={formData.total_budget}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder="Enter budget amount"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Terms & Conditions Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
              Terms & Conditions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Content Guidelines
                </label>
                <textarea
                  value={termsData.content_guidelines}
                  onChange={(e) => handleTermsChange('content_guidelines', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Must mention product features"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Disclosure Requirements
                </label>
                <textarea
                  value={termsData.disclosure_requirements}
                  onChange={(e) => handleTermsChange('disclosure_requirements', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Clear FTC compliance"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Brand Guidelines
                </label>
                <textarea
                  value={termsData.brand_guidelines}
                  onChange={(e) => handleTermsChange('brand_guidelines', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Use brand hashtags"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Usage Rights
                </label>
                <textarea
                  value={termsData.usage_rights}
                  onChange={(e) => handleTermsChange('usage_rights', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Rights to use content"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Exclusivity
                </label>
                <textarea
                  value={termsData.exclusivity}
                  onChange={(e) => handleTermsChange('exclusivity', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Non-compete terms"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Additional Terms
                </label>
                <textarea
                  value={termsData.additional_terms}
                  onChange={(e) => handleTermsChange('additional_terms', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="Any other terms"
                />
              </div>
            </div>
          </div>

          {/* Payment Terms Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
              Payment Terms
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Payment Schedule
                </label>
                <input
                  type="text"
                  value={paymentData.payment_schedule}
                  onChange={(e) => handlePaymentChange('payment_schedule', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 50% upfront, 50% on completion"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Late Fees
                </label>
                <input
                  type="text"
                  value={paymentData.late_fees}
                  onChange={(e) => handlePaymentChange('late_fees', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 5% per week"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Payment Method
                </label>
                <input
                  type="text"
                  value={paymentData.payment_method}
                  onChange={(e) => handlePaymentChange('payment_method', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., Bank transfer, PayPal"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Currency
                </label>
                <select
                  value={paymentData.currency}
                  onChange={(e) => handlePaymentChange('currency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Advance Payment
                </label>
                <input
                  type="text"
                  value={paymentData.advance_payment}
                  onChange={(e) => handlePaymentChange('advance_payment', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 30% advance"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Final Payment
                </label>
                <input
                  type="text"
                  value={paymentData.final_payment}
                  onChange={(e) => handlePaymentChange('final_payment', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 70% on completion"
                />
              </div>
            </div>
          </div>

          {/* Deliverables Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
              Deliverables
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Content Type
                </label>
                <input
                  type="text"
                  value={deliverablesData.content_type}
                  onChange={(e) => handleDeliverablesChange('content_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., Instagram posts, YouTube videos"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Quantity
                </label>
                <input
                  type="text"
                  value={deliverablesData.quantity}
                  onChange={(e) => handleDeliverablesChange('quantity', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 5 posts, 2 videos"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Format
                </label>
                <input
                  type="text"
                  value={deliverablesData.format}
                  onChange={(e) => handleDeliverablesChange('format', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 1080p, 4K, square format"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Timeline
                </label>
                <input
                  type="text"
                  value={deliverablesData.timeline}
                  onChange={(e) => handleDeliverablesChange('timeline', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  placeholder="e.g., 2 weeks, monthly"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Specifications
                </label>
                <textarea
                  value={deliverablesData.specifications}
                  onChange={(e) => handleDeliverablesChange('specifications', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="Detailed specifications for deliverables"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Revision Policy
                </label>
                <textarea
                  value={deliverablesData.revision_policy}
                  onChange={(e) => handleDeliverablesChange('revision_policy', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., 2 rounds of revisions included"
                />
              </div>
            </div>
          </div>

          {/* Jurisdiction and Dispute Resolution Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#fff' }}>
              Legal Framework
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Governing Jurisdiction <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={jurisdictionData.jurisdiction}
                  onChange={(e) => handleJurisdictionChange('jurisdiction', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                >
                  <option value="">Select jurisdiction</option>
                  {jurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction.value} value={jurisdiction.value}>
                      {jurisdiction.label}
                    </option>
                  ))}
                </select>
                {jurisdictionData.jurisdiction && jurisdictionData.jurisdiction !== "custom" && (
                  <div style={{ fontSize: '10px', color: '#a0a0a0', marginTop: '4px' }}>
                    <p style={{ fontWeight: '600' }}>Applicable Laws:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '16px', marginTop: '2px' }}>
                      {jurisdictions.find(j => j.value === jurisdictionData.jurisdiction)?.laws.map((law, index) => (
                        <li key={index}>{law}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {jurisdictionData.jurisdiction === "custom" && (
                  <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px' }}>
                    <p style={{ fontWeight: '600' }}>ℹ️ Custom jurisdiction selected. Please provide specific details below.</p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                  Dispute Resolution <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={jurisdictionData.dispute_resolution}
                  onChange={(e) => handleJurisdictionChange('dispute_resolution', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(42, 42, 42, 0.6)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                >
                  <option value="">Select resolution method</option>
                  {disputeResolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {jurisdictionData.dispute_resolution === "custom" && (
                  <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px' }}>
                    <p style={{ fontWeight: '600' }}>ℹ️ Custom dispute resolution selected. Please provide specific details below.</p>
                  </div>
                )}
              </div>

              {jurisdictionData.jurisdiction === "custom" && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                    Custom Jurisdiction Details
                  </label>
                  <textarea
                    value={jurisdictionData.custom_jurisdiction}
                    onChange={(e) => handleJurisdictionChange('custom_jurisdiction', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(42, 42, 42, 0.6)',
                      border: '1px solid rgba(42, 42, 42, 0.8)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                    placeholder="Specify your custom jurisdiction and applicable laws..."
                  />
                </div>
              )}

              {jurisdictionData.dispute_resolution === "custom" && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                    Custom Dispute Resolution
                  </label>
                  <textarea
                    value={jurisdictionData.custom_dispute_resolution}
                    onChange={(e) => handleJurisdictionChange('custom_dispute_resolution', e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(42, 42, 42, 0.6)',
                      border: '1px solid rgba(42, 42, 42, 0.8)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                    placeholder="Specify your custom dispute resolution procedure..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                padding: '12px 24px',
                background: deleteLoading ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {deleteLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Contract
                </>
              )}
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: loading ? 'rgba(99, 102, 241, 0.5)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Contract
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContractModal; 