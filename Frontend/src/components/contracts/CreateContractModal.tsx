import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { contractsApi, Contract } from '../../services/contractsApi';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractCreated: (contract: Contract) => void;
}

const CreateContractModal: React.FC<CreateContractModalProps> = ({
  isOpen,
  onClose,
  onContractCreated
}) => {
  const [formData, setFormData] = useState({
    creator_id: '',
    brand_id: '',
    contract_title: '',
    contract_type: 'one-time',
    total_budget: '',
    start_date: '',
    end_date: ''
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const contractData = {
        ...formData,
        total_budget: formData.total_budget ? parseFloat(formData.total_budget) : undefined,
        terms_and_conditions: Object.keys(cleanTermsData).length > 0 ? cleanTermsData : undefined,
        payment_terms: Object.keys(cleanPaymentData).length > 0 ? cleanPaymentData : undefined,
        deliverables: Object.keys(cleanDeliverablesData).length > 0 ? cleanDeliverablesData : undefined,
      };

      const newContract = await contractsApi.createContract(contractData);
      onContractCreated(newContract);
      onClose();
      
      // Reset all form data
      setFormData({
        creator_id: '',
        brand_id: '',
        contract_title: '',
        contract_type: 'one-time',
        total_budget: '',
        start_date: '',
        end_date: ''
      });
      
      setTermsData({
        content_guidelines: '',
        disclosure_requirements: '',
        brand_guidelines: '',
        usage_rights: '',
        exclusivity: '',
        additional_terms: ''
      });
      
      setPaymentData({
        payment_schedule: '',
        late_fees: '',
        payment_method: '',
        currency: 'USD',
        advance_payment: '',
        final_payment: ''
      });
      
      setDeliverablesData({
        content_type: '',
        quantity: '',
        format: '',
        specifications: '',
        timeline: '',
        revision_policy: ''
      });
    } catch (err) {
      console.error('Error creating contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>Create New Contract</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Creator ID *
              </label>
              <input
                type="text"
                name="creator_id"
                value={formData.creator_id}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder="Enter creator ID"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#a0a0a0' }}>
                Brand ID *
              </label>
              <input
                type="text"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(42, 42, 42, 0.6)',
                  border: '1px solid rgba(42, 42, 42, 0.8)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
                placeholder="Enter brand ID"
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Contract
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContractModal; 