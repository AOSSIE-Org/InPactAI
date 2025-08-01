import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
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
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import ContractDetailsModal from '../components/contracts/ContractDetailsModal';

// Mock data for contracts
const mockContracts = [
  {
    id: '1',
    title: 'Tech Product Review Campaign',
    creator: 'TechCreator',
    brand: 'TechCorp Inc.',
    status: 'active',
    type: 'one-time',
    budget: 5000,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    progress: 75,
    milestones: 3,
    completedMilestones: 2,
    deliverables: 4,
    completedDeliverables: 3,
    payments: [
      { amount: 2500, status: 'paid', date: '2024-01-15' },
      { amount: 2500, status: 'pending', date: '2024-02-15' }
    ]
  },
  {
    id: '2',
    title: 'Fashion Collection Promotion',
    creator: 'FashionInfluencer',
    brand: 'StyleBrand',
    status: 'pending',
    type: 'ongoing',
    budget: 9000,
    startDate: '2024-02-01',
    endDate: '2024-05-01',
    progress: 25,
    milestones: 3,
    completedMilestones: 1,
    deliverables: 12,
    completedDeliverables: 3,
    payments: [
      { amount: 3000, status: 'paid', date: '2024-02-01' },
      { amount: 3000, status: 'pending', date: '2024-03-01' },
      { amount: 3000, status: 'pending', date: '2024-04-01' }
    ]
  },
  {
    id: '3',
    title: 'Gaming Content Series',
    creator: 'GameMaster',
    brand: 'GameStudio',
    status: 'draft',
    type: 'performance-based',
    budget: 7500,
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    progress: 0,
    milestones: 4,
    completedMilestones: 0,
    deliverables: 9,
    completedDeliverables: 0,
    payments: [
      { amount: 2000, status: 'pending', date: '2024-03-01' },
      { amount: 2000, status: 'pending', date: '2024-04-01' },
      { amount: 2000, status: 'pending', date: '2024-05-01' },
      { amount: 1500, status: 'pending', date: '2024-06-01' }
    ]
  }
];

const Contracts = () => {
  const [contracts, setContracts] = useState(mockContracts);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  // Calculate stats
  const stats = {
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    draft: contracts.filter(c => c.status === 'draft').length,
    completed: contracts.filter(c => c.status === 'completed').length,
    totalBudget: contracts.reduce((sum, c) => sum + c.budget, 0),
    totalRevenue: contracts.reduce((sum, c) => {
      const paidPayments = c.payments.filter(p => p.status === 'paid');
      return sum + paidPayments.reduce((pSum, p) => pSum + p.amount, 0);
    }, 0)
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '24px',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Contracts</h1>
            <p style={{ fontSize: '16px', color: '#a0a0a0' }}>Manage your brand partnerships and creator agreements</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} />
            Create Contract
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(42, 42, 42, 0.6)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Active Contracts</div>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>{stats.active}</div>
          <div style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>+2 from last month</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(42, 42, 42, 0.6)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Pending Contracts</div>
            <Clock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>{stats.pending}</div>
          <div style={{ fontSize: '14px', color: '#f59e0b', marginTop: '8px' }}>Awaiting signatures</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(42, 42, 42, 0.6)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Total Budget</div>
            <DollarSign size={20} style={{ color: '#6366f1' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>${stats.totalBudget.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#6366f1', marginTop: '8px' }}>Across all contracts</div>
        </div>

        <div style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(42, 42, 42, 0.6)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>Revenue Generated</div>
            <TrendingUp size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>${stats.totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>From completed contracts</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(42, 42, 42, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#a0a0a0' 
            }} />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: 'rgba(42, 42, 42, 0.6)',
                border: '1px solid rgba(42, 42, 42, 0.8)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(42, 42, 42, 0.6)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>

          {/* Quick Actions */}
          <button style={{
            padding: '12px 16px',
            background: 'rgba(42, 42, 42, 0.6)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Upload size={16} />
            Import
          </button>

          <button style={{
            padding: '12px 16px',
            background: 'rgba(42, 42, 42, 0.6)',
            border: '1px solid rgba(42, 42, 42, 0.8)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Contracts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
            style={{
              background: 'rgba(26, 26, 26, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(42, 42, 42, 0.6)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => setSelectedContract(contract)}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {contract.creator.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{contract.title}</h3>
                  <p style={{ fontSize: '14px', color: '#a0a0a0' }}>{contract.creator} • {contract.brand}</p>
                </div>
              </div>
              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                background: getStatusBgColor(contract.status),
                color: getStatusColor(contract.status)
              }}>
                {getStatusText(contract.status)}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Progress</span>
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

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Budget</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>${contract.budget.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Type</div>
                <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>{contract.type}</div>
              </div>
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

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{
                padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '6px',
                color: '#6366f1',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Eye size={14} />
                View
              </button>
              <button style={{
                padding: '8px 12px',
                background: 'rgba(42, 42, 42, 0.6)',
                border: '1px solid rgba(42, 42, 42, 0.8)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Edit size={14} />
                Edit
              </button>
              <button style={{
                padding: '8px 12px',
                background: 'rgba(42, 42, 42, 0.6)',
                border: '1px solid rgba(42, 42, 42, 0.8)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#a0a0a0'
        }}>
          <FileText size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No contracts found</h3>
          <p style={{ fontSize: '16px' }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Contract Details Modal */}
      <ContractDetailsModal 
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
      />
    </div>
  );
};

export default Contracts;