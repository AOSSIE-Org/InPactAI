import React, { useState, useEffect } from 'react';
import { X, Plus, MessageSquare, FileText, DollarSign, Calendar, Target } from 'lucide-react';

interface Contract {
  id: string;
  sponsorship_id?: string;
  creator_id: string;
  brand_id: string;
  contract_title?: string;
  contract_type: string;
  terms_and_conditions?: any;
  payment_terms?: any;
  deliverables?: any;
  start_date?: string;
  end_date?: string;
  total_budget?: number;
  payment_schedule?: any;
  legal_compliance?: any;
  contract_url?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  comments?: Array<{
    comment: string;
    timestamp: string;
    user: string;
  }>;
  update_history?: Array<{
    timestamp: string;
    updated_by: string;
    updates: any;
  }>;
}

interface UpdateContractModalProps {
  contract: Contract | null;
  onClose: () => void;
  onUpdate: (contractId: string, updateData: any) => Promise<void>;
}

interface UpdateData {
  status_update?: string;
  budget_adjustment?: number;
  new_deliverables?: string;
  timeline_update?: string;
  additional_terms?: string;
  deliverable_status_updates?: Array<{
    deliverable_id: string;
    new_status: string;
    notes?: string;
  }>;
}

const UpdateContractModal: React.FC<UpdateContractModalProps> = ({ contract, onClose, onUpdate }) => {
  const [updateData, setUpdateData] = useState<UpdateData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('comments');

  if (!contract) return null;

  const handleInputChange = (field: keyof UpdateData, value: string | number) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(updateData).length === 0) {
      alert('Please add at least one update');
      return;
    }

    setIsSubmitting(true);
    try {
      // Add timestamp to the update
      const updateWithTimestamp = {
        ...updateData,
        update_timestamp: new Date().toISOString(),
        updated_by: 'current_user' // This should come from auth context
      };

      await onUpdate(contract.id, updateWithTimestamp);
      onClose();
    } catch (error) {
      console.error('Error updating contract:', error);
      alert('Failed to update contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: 'status', label: 'Status Update', icon: Target },
    { id: 'budget', label: 'Budget Adjustment', icon: DollarSign },
    { id: 'deliverables', label: 'Deliverables', icon: FileText },
    { id: 'timeline', label: 'Timeline Update', icon: Calendar }
  ];



  const renderStatusSection = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Status Update
        </label>
        <select
          value={updateData.status_update || ''}
          onChange={(e) => handleInputChange('status_update', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
          }}
        >
          <option value="">Select status update...</option>
          <option value="in_progress">In Progress</option>
          <option value="review_pending">Review Pending</option>
          <option value="approved">Approved</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Additional Notes
        </label>
        <textarea
          value={updateData.additional_terms || ''}
          onChange={(e) => handleInputChange('additional_terms', e.target.value)}
          placeholder="Add any additional notes about the status change..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderBudgetSection = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Budget Adjustment Amount
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a0a0a0',
            fontSize: '14px'
          }}>
            $
          </span>
          <input
            type="number"
            value={updateData.budget_adjustment || ''}
            onChange={(e) => handleInputChange('budget_adjustment', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '12px 12px 12px 32px',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
          Current budget: ${(contract.total_budget || 0).toLocaleString()}
        </div>
      </div>
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Reason for Adjustment
        </label>
        <textarea
          value={updateData.comments || ''}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          placeholder="Explain the reason for the budget adjustment..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderDeliverablesSection = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Existing Deliverables Status Updates */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '12px',
          color: '#fff'
        }}>
          Update Deliverable Status
        </label>
        <div style={{ display: 'grid', gap: '12px' }}>
          {['Video Review', 'Instagram Post 1', 'Instagram Post 2'].map((deliverable, index) => (
            <div key={index} style={{
              padding: '16px',
              background: 'rgba(26, 26, 26, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(42, 42, 42, 0.8)'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                  {deliverable}
                </div>
                <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                  Current Status: <span style={{ color: '#f59e0b' }}>Pending</span>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <select
                  onChange={(e) => {
                    const currentUpdates = updateData.deliverable_status_updates || [];
                    const existingIndex = currentUpdates.findIndex(u => u.deliverable_id === `deliverable_${index}`);
                    
                    if (existingIndex >= 0) {
                      currentUpdates[existingIndex].new_status = e.target.value;
                    } else {
                      currentUpdates.push({
                        deliverable_id: `deliverable_${index}`,
                        new_status: e.target.value,
                        notes: ''
                      });
                    }
                    
                    handleInputChange('deliverable_status_updates', currentUpdates);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'rgba(26, 26, 26, 0.8)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select new status...</option>
                  <option value="in_progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="revision_requested">Revision Requested</option>
                  <option value="completed">Completed</option>
                </select>
                <textarea
                  placeholder="Add notes about this status change..."
                  onChange={(e) => {
                    const currentUpdates = updateData.deliverable_status_updates || [];
                    const existingIndex = currentUpdates.findIndex(u => u.deliverable_id === `deliverable_${index}`);
                    
                    if (existingIndex >= 0) {
                      currentUpdates[existingIndex].notes = e.target.value;
                    } else {
                      currentUpdates.push({
                        deliverable_id: `deliverable_${index}`,
                        new_status: '',
                        notes: e.target.value
                      });
                    }
                    
                    handleInputChange('deliverable_status_updates', currentUpdates);
                  }}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '8px 12px',
                    background: 'rgba(26, 26, 26, 0.8)',
                    border: '1px solid rgba(42, 42, 42, 0.8)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Deliverables */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Add New Deliverables
        </label>
        <textarea
          value={updateData.new_deliverables || ''}
          onChange={(e) => handleInputChange('new_deliverables', e.target.value)}
          placeholder="Add new deliverables or additional requirements..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderTimelineSection = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: '#fff'
        }}>
          Timeline Update
        </label>
        <textarea
          value={updateData.timeline_update || ''}
          onChange={(e) => handleInputChange('timeline_update', e.target.value)}
          placeholder="Update timeline, deadlines, or milestones..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'status': return renderStatusSection();
      case 'budget': return renderBudgetSection();
      case 'deliverables': return renderDeliverablesSection();
      case 'timeline': return renderTimelineSection();
      default: return renderStatusSection();
    }
  };

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        border: '1px solid rgba(42, 42, 42, 0.6)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(42, 42, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Update Contract</h2>
            <p style={{ fontSize: '14px', color: '#a0a0a0' }}>
              Add updates to {contract.contract_title || `Contract ${contract.id.slice(0, 8)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              background: 'rgba(42, 42, 42, 0.6)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs */}
        <div style={{
          padding: '0 24px',
          borderBottom: '1px solid rgba(42, 42, 42, 0.6)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '12px 16px',
                  background: activeSection === section.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeSection === section.id ? '#6366f1' : '#a0a0a0',
                  fontSize: '14px',
                  fontWeight: activeSection === section.id ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {renderSectionContent()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid rgba(42, 42, 42, 0.6)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#a0a0a0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(updateData).length === 0}
            style={{
              padding: '12px 24px',
              background: isSubmitting || Object.keys(updateData).length === 0 
                ? 'rgba(42, 42, 42, 0.6)' 
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmitting || Object.keys(updateData).length === 0 ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || Object.keys(updateData).length === 0 ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Updating...' : 'Add Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateContractModal; 