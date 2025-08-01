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
  Edit,
  Download,
  MessageSquare,
  BarChart3,
  CreditCard,
  Target,
  Award
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  creator: string;
  brand: string;
  status: string;
  type: string;
  budget: number;
  startDate: string;
  endDate: string;
  progress: number;
  milestones: number;
  completedMilestones: number;
  deliverables: number;
  completedDeliverables: number;
  payments: Array<{
    amount: number;
    status: string;
    date: string;
  }>;
}

interface ContractDetailsModalProps {
  contract: Contract | null;
  onClose: () => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!contract) return null;

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
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'deliverables', label: 'Deliverables', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'comments', label: 'Comments', icon: MessageSquare }
  ];

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
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.title}</div>
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
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.creator}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Brand</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{contract.brand}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Contract Type</div>
            <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>{contract.type}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Total Budget</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>${contract.budget.toLocaleString()}</div>
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
            <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Overall Progress</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{contract.progress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(42, 42, 42, 0.6)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${contract.progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Milestones</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {contract.completedMilestones}/{contract.milestones}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Deliverables</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {contract.completedDeliverables}/{contract.deliverables}
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
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{contract.startDate}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Contract End</div>
              <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{contract.endDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMilestones = () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {contract.milestones > 0 && (
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
                  <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
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
          {contract.payments.map((payment, index) => (
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
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{
        background: 'rgba(42, 42, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(42, 42, 42, 0.8)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Comments & Negotiations</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{
            padding: '16px',
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                B
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Brand Manager</div>
                <div style={{ fontSize: '12px', color: '#a0a0a0' }}>2 hours ago</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Looking forward to working with you on this tech review! The product specs have been updated.
            </div>
          </div>
          <div style={{
            padding: '16px',
            background: 'rgba(26, 26, 26, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(42, 42, 42, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                C
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Creator</div>
                <div style={{ fontSize: '12px', color: '#a0a0a0' }}>1 hour ago</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Thanks! I'll make sure to create high-quality content that showcases the product well.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
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
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{contract.title}</h2>
            <p style={{ fontSize: '14px', color: '#a0a0a0' }}>{contract.creator} • {contract.brand}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#6366f1',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Edit size={16} />
              Edit
            </button>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(42, 42, 42, 0.6)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Download size={16} />
              Export
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
    </div>
  );
};

export default ContractDetailsModal; 