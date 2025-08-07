import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Eye,
  MessageSquare,
  BarChart3,
  CreditCard,
  Target,
  Award,
  Plus,
  Edit,
  Download
} from 'lucide-react';
import UpdateContractModal from './UpdateContractModal';
import { contractsApi } from '../../services/contractsApi';

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

interface ContractDetailsModalProps {
  contract: Contract | null;
  onClose: () => void;
  onContractUpdate?: (updatedContract: Contract) => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose, onContractUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!contract) return null;

  const handleUpdateContract = async (contractId: string, updateData: any) => {
    try {
      await contractsApi.addContractUpdate(contractId, updateData);
      
      // Refresh the contract data
      try {
        const updatedContract = await contractsApi.getContract(contractId);
        if (onContractUpdate) {
          onContractUpdate(updatedContract);
        }
      } catch (refreshError) {
        console.error('Error refreshing contract data:', refreshError);
      }
      
      setShowUpdateModal(false);
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await contractsApi.addContractUpdate(contract.id, {
        comments: newComment,
        update_timestamp: new Date().toISOString(),
        updated_by: 'current_user' // This should come from auth context
      });
      setNewComment('');
      
      // Refresh the contract data
      try {
        const updatedContract = await contractsApi.getContract(contract.id);
        if (onContractUpdate) {
          onContractUpdate(updatedContract);
        }
      } catch (refreshError) {
        console.error('Error refreshing contract data:', refreshError);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleExportContract = async () => {
    setIsExporting(true);
    try {
      // Create a download link for the file
      const response = await fetch(`http://localhost:8000/api/contracts/${contract.id}/export/download`);
      if (!response.ok) {
        throw new Error('Failed to export contract');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.contract_title || 'Contract'}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Contract exported successfully!');
    } catch (error) {
      console.error('Error exporting contract:', error);
      alert('Error exporting contract. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'draft': return '#6b7280';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'rgba(16, 185, 129, 0.2)';
      case 'pending': return 'rgba(245, 158, 11, 0.2)';
      case 'draft': return 'rgba(107, 114, 128, 0.2)';
      case 'completed': return 'rgba(59, 130, 246, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'deliverables', label: 'Deliverables', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'comments', label: 'Comments', icon: MessageSquare }
  ];

  const renderTerms = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Terms & Conditions */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Terms & Conditions</h3>
        {contract.terms_and_conditions ? (
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#fff' }}>
            {typeof contract.terms_and_conditions === 'string' ? (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'inherit',
                margin: 0,
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {contract.terms_and_conditions}
              </pre>
            ) : (
              <div style={{ 
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {Object.entries(contract.terms_and_conditions).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6366f1',
                      marginBottom: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#a0a0a0',
            fontSize: '16px'
          }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No terms and conditions have been set for this contract.</p>
          </div>
        )}
      </div>

      {/* Payment Terms */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment Terms</h3>
        {contract.payment_terms ? (
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#fff' }}>
            {typeof contract.payment_terms === 'string' ? (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'inherit',
                margin: 0,
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {contract.payment_terms}
              </pre>
            ) : (
              <div style={{ 
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {Object.entries(contract.payment_terms).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6366f1',
                      marginBottom: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#a0a0a0',
            fontSize: '16px'
          }}>
            <DollarSign size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No payment terms have been set for this contract.</p>
          </div>
        )}
      </div>

      {/* Legal Compliance */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Legal Compliance</h3>
        {contract.legal_compliance ? (
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#fff' }}>
            {typeof contract.legal_compliance === 'string' ? (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'inherit',
                margin: 0,
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {contract.legal_compliance}
              </pre>
            ) : (
              <div style={{ 
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                {Object.entries(contract.legal_compliance).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#6366f1',
                      marginBottom: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
                      {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#a0a0a0',
            fontSize: '16px'
          }}>
            <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No legal compliance information has been set for this contract.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Contract Info */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Contract Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Contract Title</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.contract_title || `Contract ${contract.id.slice(0, 8)}`}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Status</div>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              background: getStatusBgColor(contract.status),
              color: getStatusColor(contract.status)
            }}>
              {getStatusText(contract.status)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Creator</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.creator_id}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Brand</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.brand_id}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Contract Type</div>
            <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>{contract.contract_type}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Total Budget</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>${(contract.total_budget || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Progress Overview</h3>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Contract Status</span>
            <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{contract.status}</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(42, 42, 42, 0.6)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Created</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {new Date(contract.created_at).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Last Updated</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {contract.updated_at ? new Date(contract.updated_at).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Timeline</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Contract Start</div>
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{contract.start_date || 'Not set'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Contract End</div>
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{contract.end_date || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Milestones section - will be implemented when we add milestones API */}
      {false && (
        <div style={{
          background: 'rgba(42, 42, 42, 0.6)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(42, 42, 42, 0.8)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Milestones</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {['Advance Payment', 'Content Creation', 'Final Payment'].map((milestone, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'rgba(26, 26, 26, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(42, 42, 42, 0.8)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index < contract.completedMilestones ? '#10b981' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {index < contract.completedMilestones ? <CheckCircle size={16} color="#fff" /> : <Clock size={16} color="#fff" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{milestone}</div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                      {index === 0 ? 'Immediate' : index === 1 ? 'Due in 15 days' : 'Due on completion'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    ${index === 0 ? 2500 : index === 1 ? 0 : 2500}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: index < contract.completedMilestones ? '#10b981' : '#f59e0b' 
                  }}>
                    {index < contract.completedMilestones ? 'Completed' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDeliverables = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Deliverables</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {['Video Review', 'Instagram Post 1', 'Instagram Post 2'].map((deliverable, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'rgba(26, 26, 26, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(42, 42, 42, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index < contract.completedDeliverables ? '#10b981' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {index < contract.completedDeliverables ? <CheckCircle size={16} color="#fff" /> : <FileText size={16} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{deliverable}</div>
                  <div style={{ fontSize: '12px', color: '#a0a0a0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={index === 0 ? '/youtube.png' : '/instagram.png'} 
                      alt={index === 0 ? 'YouTube' : 'Instagram'}
                      style={{ width: '16px', height: '16px' }}
                    />
                    {index === 0 ? 'YouTube' : 'Instagram'} • Due in {index === 0 ? '15' : index === 1 ? '20' : '25'} days
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: index < contract.completedDeliverables ? '#10b981' : '#f59e0b' 
                }}>
                  {index < contract.completedDeliverables ? 'Approved' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment History</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Payments section - will be implemented when we add payments API */}
        {false && contract.payments && contract.payments.map((payment, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: 'rgba(26, 26, 26, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(42, 42, 42, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: payment.status === 'paid' ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {payment.status === 'paid' ? <CheckCircle size={16} color="#fff" /> : <Clock size={16} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {index === 0 ? 'Advance Payment' : index === 1 ? 'Final Payment' : `Payment ${index + 1}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{payment.date}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>${payment.amount.toLocaleString()}</div>
                <div style={{ 
                  fontSize: '12px', 
                  color: payment.status === 'paid' ? '#10b981' : '#f59e0b' 
                }}>
                  {payment.status === 'paid' ? 'Paid' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Performance Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <TrendingUp size={16} style={{ color: '#10b981' }} />
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Engagement Rate</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>4.5%</div>
            <div style={{ fontSize: '12px', color: '#10b981' }}>+0.3% from last month</div>
          </div>
          <div style={{
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Eye size={16} style={{ color: '#6366f1' }} />
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Total Reach</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6366f1' }}>50K</div>
            <div style={{ fontSize: '12px', color: '#6366f1' }}>+15% from last month</div>
          </div>
          <div style={{
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={16} style={{ color: '#f59e0b' }} />
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>ROI</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>125%</div>
            <div style={{ fontSize: '12px', color: '#f59e0b' }}>+25% from last month</div>
          </div>
          <div style={{
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DollarSign size={16} style={{ color: '#10b981' }} />
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Revenue Generated</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>$2.5K</div>
            <div style={{ fontSize: '12px', color: '#10b981' }}>From this contract</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderComments = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Default welcome messages if no comments */}
        {(!contract.comments || contract.comments.length === 0) && (
          <>
            <div style={{
              alignSelf: 'flex-start',
              maxWidth: '70%',
              padding: '12px 16px',
              background: 'rgba(42, 42, 42, 0.8)',
              borderRadius: '18px 18px 18px 4px',
              border: '1px solid rgba(42, 42, 42, 0.8)'
            }}>
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Looking forward to working with you on this tech review! The product specs have been updated.
              </div>
              <div style={{ fontSize: '11px', color: '#a0a0a0', marginTop: '4px' }}>
                Brand Manager • 2 hours ago
              </div>
            </div>
            <div style={{
              alignSelf: 'flex-end',
              maxWidth: '70%',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '18px 18px 4px 18px',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Thanks! I'll make sure to create high-quality content that showcases the product well.
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
                You • 1 hour ago
              </div>
            </div>
          </>
        )}

        {/* Actual comments */}
        {contract.comments && contract.comments.map((comment: any, index: number) => (
          <div key={index} style={{
            alignSelf: comment.user === 'current_user' ? 'flex-end' : 'flex-start',
            maxWidth: '70%',
            padding: '12px 16px',
            background: comment.user === 'current_user' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'rgba(42, 42, 42, 0.8)',
            borderRadius: comment.user === 'current_user' 
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            border: comment.user === 'current_user'
              ? '1px solid rgba(99, 102, 241, 0.3)'
              : '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              {comment.comment}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: comment.user === 'current_user' ? 'rgba(255, 255, 255, 0.7)' : '#a0a0a0', 
              marginTop: '4px' 
            }}>
              {comment.user === 'current_user' ? 'You' : comment.user} • {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(42, 42, 42, 0.6)',
        background: 'rgba(26, 26, 26, 0.95)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              style={{
                width: '100%',
                minHeight: '50px',
                maxHeight: '100px',
                padding: '12px 16px',
                background: 'rgba(42, 42, 42, 0.8)',
                border: '1px solid rgba(42, 42, 42, 0.8)',
                borderRadius: '20px',
                color: '#fff',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={isSubmittingComment || !newComment.trim()}
            style={{
              padding: '12px 16px',
              background: isSubmittingComment || !newComment.trim() 
                ? 'rgba(42, 42, 42, 0.6)' 
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isSubmittingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmittingComment || !newComment.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: '80px',
              justifyContent: 'center'
            }}
          >
            <MessageSquare size={16} />
            {isSubmittingComment ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'terms': return renderTerms();
      case 'milestones': return renderMilestones();
      case 'deliverables': return renderDeliverables();
      case 'payments': return renderPayments();
      case 'analytics': return renderAnalytics();
      case 'comments': return renderComments();
      default: return renderOverview();
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
        maxWidth: '1000px',
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
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{contract.contract_title || `Contract ${contract.id.slice(0, 8)}`}</h2>
            <p style={{ fontSize: '14px', color: '#a0a0a0' }}>{contract.creator_id} • {contract.brand_id}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleExportContract}
              disabled={isExporting}
              style={{
                padding: '8px 16px',
                background: isExporting 
                  ? 'rgba(42, 42, 42, 0.6)' 
                  : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                opacity: isExporting ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={() => setShowUpdateModal(true)}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Update
            </button>
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
        </div>

        {/* Tabs */}
        <div style={{
          padding: '0 24px',
          borderBottom: '1px solid rgba(42, 42, 42, 0.6)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeTab === tab.id ? '#6366f1' : '#a0a0a0',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 140px)'
        }}>
          {renderTabContent()}
        </div>
      </div>
      
      {/* Update Contract Modal */}
      {showUpdateModal && (
        <UpdateContractModal
          contract={contract}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdateContract}
        />
      )}
    </div>
  );
};

export default ContractDetailsModal; 