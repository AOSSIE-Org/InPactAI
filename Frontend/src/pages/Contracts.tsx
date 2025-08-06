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
  Upload,
  Loader2,
  Wand2
} from 'lucide-react';
import ContractDetailsModal from '../components/contracts/ContractDetailsModal';
import CreateContractModal from '../components/contracts/CreateContractModal';
import EditContractModal from '../components/contracts/EditContractModal';
import AdvancedFilters from '../components/contracts/AdvancedFilters';
import ContractAIAssistant from '../components/contracts/ContractAIAssistant';
import SmartContractGenerator from '../components/contracts/SmartContractGenerator';
import { contractsApi, Contract, ContractStats } from '../services/contractsApi';
import { useAuth } from '../context/AuthContext';

// API data will be fetched from the backend

const Contracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    id: string;
    username: string;
    role: 'creator' | 'brand';
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedContractForAI, setSelectedContractForAI] = useState<string | undefined>(undefined);
  const [showSmartGenerator, setShowSmartGenerator] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all',
    contract_type: 'all',
    min_budget: '',
    max_budget: '',
    start_date_from: '',
    start_date_to: '',
    creator_id: '',
    brand_id: '',
    search_term: ''
  });

  // Fetch current user info from users table
  useEffect(() => {
    const fetchCurrentUserInfo = async () => {
      if (!user?.email) return;
      
      try {
        const response = await fetch(`http://localhost:8000/api/contracts/generation/user-by-email?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserInfo({
            id: userData.id,
            username: userData.username,
            role: userData.role
          });
        } else if (response.status === 404) {
          console.warn('User not found in database, Smart Contract Generator will work without auto-fill');
        } else {
          console.warn('Backend not available, Smart Contract Generator will work without auto-fill');
        }
      } catch (error) {
        console.warn('Error fetching current user info (backend may be down):', error);
        // Don't throw error, just log it and continue
      }
    };

    fetchCurrentUserInfo();
  }, [user]);

  // Fetch contracts and stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch contracts and stats in parallel
        const [contractsData, statsData] = await Promise.all([
          contractsApi.getContracts(),
          contractsApi.getContractStats()
        ]);
        
        setContracts(contractsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contracts';
        
        // Check if it's a backend availability issue
        if (errorMessage.includes('Backend server is not available')) {
          setError('Backend server is not available. Some features may be limited. Please try again later.');
          // Set empty arrays so the interface still works
          setContracts([]);
          setStats({
            total_contracts: 0,
            active_contracts: 0,
            completed_contracts: 0,
            draft_contracts: 0,
            total_budget: 0,
            average_contract_value: 0
          });
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from API data
  const calculatedStats = {
    active: stats?.active_contracts || 0,
    pending: stats?.draft_contracts || 0, // Using draft as pending for now
    draft: stats?.draft_contracts || 0,
    completed: stats?.completed_contracts || 0,
    totalBudget: stats?.total_budget || 0,
    totalRevenue: contracts.reduce((sum, c) => {
      // For now, we'll calculate revenue from completed contracts
      if (c.status === 'signed' || c.status === 'active') {
        return sum + (c.total_budget || 0);
      }
      return sum;
    }, 0)
  };

  const handleContractCreated = (newContract: Contract) => {
    setContracts(prev => [newContract, ...prev]);
  };

  const handleContractUpdated = (updatedContract: Contract) => {
    setContracts(prev => prev.map(c => c.id === updatedContract.id ? updatedContract : c));
  };

  const handleContractDeleted = (contractId: string) => {
    setContracts(prev => prev.filter(c => c.id !== contractId));
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowEditModal(true);
  };

  const handleAdvancedFiltersChange = (newFilters: typeof advancedFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      status: 'all',
      contract_type: 'all',
      min_budget: '',
      max_budget: '',
      start_date_from: '',
      start_date_to: '',
      creator_id: '',
      brand_id: '',
      search_term: ''
    });
  };

  const handleContractGenerated = async (generatedContract: any) => {
    try {
      // Convert generated contract to the format expected by the API
      const contractData = {
        creator_id: generatedContract.creator_id || 'u113',
        brand_id: generatedContract.brand_id || 'u114',
        contract_title: generatedContract.contract_title,
        contract_type: generatedContract.contract_type,
        total_budget: generatedContract.total_budget,
        start_date: generatedContract.start_date,
        end_date: generatedContract.end_date,
        terms_and_conditions: generatedContract.terms_and_conditions,
        payment_terms: generatedContract.payment_terms,
        deliverables: generatedContract.deliverables,
        legal_compliance: generatedContract.legal_compliance,
        status: 'draft'
      };

      // Create the contract using the API
      const newContract = await contractsApi.createContract(contractData);
      
      // Add to the contracts list
      setContracts(prev => [newContract, ...prev]);
      
      alert('Contract generated and created successfully!');
    } catch (error) {
      console.error('Error creating generated contract:', error);
      alert('Failed to create the generated contract. Please try again.');
    }
  };

  // Export functionality
  const handleExport = () => {
    // Create and show export modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(20px);
      borderRadius: 16px;
      padding: 32px;
      border: 1px solid rgba(42, 42, 42, 0.6);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      text-align: center;
    `;

    modalContent.innerHTML = `
      <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #fff;">
        Choose Export Format
      </h3>
      <p style="font-size: 14px; color: #a0a0a0; margin-bottom: 24px;">
        Select the format for your contract export:
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="json-export" style="
          padding: 12px 24px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 8px;
          color: #6366f1;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          JSON
        </button>
        <button id="csv-export" style="
          padding: 12px 24px;
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          color: #22c55e;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        ">
          CSV
        </button>
      </div>
      <button id="cancel-export" style="
        margin-top: 16px;
        padding: 8px 16px;
        background: rgba(42, 42, 42, 0.6);
        border: 1px solid rgba(42, 42, 42, 0.8);
        border-radius: 6px;
        color: #a0a0a0;
        font-size: 12px;
        cursor: pointer;
      ">
        Cancel
      </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listeners
    const jsonButton = modal.querySelector('#json-export');
    const csvButton = modal.querySelector('#csv-export');
    const cancelButton = modal.querySelector('#cancel-export');

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    const exportData = (format: 'json' | 'csv') => {
      try {
        if (format === 'json') {
          // JSON Export
          const exportData = {
            contracts: filteredContracts,
            exportDate: new Date().toISOString(),
            totalContracts: filteredContracts.length,
            stats: calculatedStats
          };

          const dataStr = JSON.stringify(exportData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `contracts-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // CSV Export
          const csvHeaders = [
            'ID',
            'Title',
            'Creator ID',
            'Brand ID',
            'Type',
            'Status',
            'Budget',
            'Start Date',
            'End Date',
            'Created At',
            'Updated At'
          ];

          const csvData = filteredContracts.map(contract => [
            contract.id,
            contract.contract_title || '',
            contract.creator_id,
            contract.brand_id,
            contract.contract_type,
            contract.status,
            contract.total_budget || 0,
            contract.start_date || '',
            contract.end_date || '',
            contract.created_at,
            contract.updated_at || ''
          ]);

          const csvContent = [
            csvHeaders.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
          ].join('\n');

          const dataBlob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `contracts-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        closeModal();
      } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
        closeModal();
      }
    };

    // Add hover effects
    jsonButton?.addEventListener('mouseenter', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(99, 102, 241, 0.3)';
    });
    jsonButton?.addEventListener('mouseleave', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(99, 102, 241, 0.2)';
    });

    csvButton?.addEventListener('mouseenter', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(34, 197, 94, 0.3)';
    });
    csvButton?.addEventListener('mouseleave', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(34, 197, 94, 0.2)';
    });

    // Add click handlers
    jsonButton?.addEventListener('click', () => exportData('json'));
    csvButton?.addEventListener('click', () => exportData('csv'));
    cancelButton?.addEventListener('click', closeModal);

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  };

  // Import functionality
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (importData.contracts && Array.isArray(importData.contracts)) {
          // Validate and process imported contracts
          const validContracts = importData.contracts.filter((contract: any) => {
            return contract.creator_id && contract.brand_id && contract.contract_type;
          });

          if (validContracts.length === 0) {
            alert('No valid contracts found in the imported file.');
            return;
          }

          // Show preview modal for imported contracts
          const confirmed = window.confirm(
            `Found ${validContracts.length} contracts to import. Do you want to proceed?`
          );

          if (confirmed) {
            // Import each contract
            const importPromises = validContracts.map(async (contract: any) => {
              try {
                return await contractsApi.createContract({
                  creator_id: contract.creator_id,
                  brand_id: contract.brand_id,
                  contract_title: contract.contract_title,
                  contract_type: contract.contract_type,
                  total_budget: contract.total_budget,
                  start_date: contract.start_date,
                  end_date: contract.end_date,
                  terms_and_conditions: contract.terms_and_conditions,
                  payment_terms: contract.payment_terms,
                  deliverables: contract.deliverables,
                  status: 'draft' // Import as draft by default
                });
              } catch (error) {
                console.error('Failed to import contract:', error);
                return null;
              }
            });

            const results = await Promise.all(importPromises);
            const successfulImports = results.filter(result => result !== null);
            
            if (successfulImports.length > 0) {
              // Refresh the contracts list
              const updatedContracts = await contractsApi.getContracts();
              setContracts(updatedContracts);
              alert(`Successfully imported ${successfulImports.length} contracts.`);
            } else {
              alert('Failed to import any contracts. Please check the file format.');
            }
          }
        } else {
          alert('Invalid file format. Please select a valid contracts export file.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Import failed. Please check the file format and try again.');
      }
    };
    input.click();
  };

  // Advanced filtering logic
  const filteredContracts = contracts.filter(contract => {
    // Basic status filter
    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;
    
    // Advanced filters
    const matchesAdvancedStatus = advancedFilters.status === 'all' || contract.status === advancedFilters.status;
    const matchesContractType = advancedFilters.contract_type === 'all' || contract.contract_type === advancedFilters.contract_type;
    
    // Budget filtering
    const budget = contract.total_budget || 0;
    const minBudget = advancedFilters.min_budget ? parseFloat(advancedFilters.min_budget) : 0;
    const maxBudget = advancedFilters.max_budget ? parseFloat(advancedFilters.max_budget) : Infinity;
    const matchesBudget = budget >= minBudget && budget <= maxBudget;
    
    // Date filtering
    const startDate = contract.start_date ? new Date(contract.start_date) : null;
    const fromDate = advancedFilters.start_date_from ? new Date(advancedFilters.start_date_from) : null;
    const toDate = advancedFilters.start_date_to ? new Date(advancedFilters.start_date_to) : null;
    const matchesDate = (!fromDate || (startDate && startDate >= fromDate)) && 
                       (!toDate || (startDate && startDate <= toDate));
    
    // Creator/Brand filtering
    const matchesCreator = !advancedFilters.creator_id || 
                          contract.creator_id.toLowerCase().includes(advancedFilters.creator_id.toLowerCase());
    const matchesBrand = !advancedFilters.brand_id || 
                        contract.brand_id.toLowerCase().includes(advancedFilters.brand_id.toLowerCase());
    
    // Search term filtering
    const searchLower = advancedFilters.search_term.toLowerCase();
    const matchesSearch = !advancedFilters.search_term ||
                         (contract.contract_title || '').toLowerCase().includes(searchLower) ||
                         contract.creator_id.toLowerCase().includes(searchLower) ||
                         contract.brand_id.toLowerCase().includes(searchLower);
    
    // Basic search term
    const matchesBasicSearch = (contract.contract_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              contract.creator_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              contract.brand_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesBasicSearch && 
           matchesAdvancedStatus && matchesContractType && matchesBudget && 
           matchesDate && matchesCreator && matchesBrand && matchesSearch;
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '24px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px' }} />
          <p>Loading contracts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '24px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ marginBottom: '16px', color: '#ef4444' }} />
          <h3 style={{ marginBottom: '8px' }}>Error loading contracts</h3>
          <p style={{ color: '#a0a0a0' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '24px',
      color: '#fff'
    }}>
      {/* Backend Status Banner */}
      {error && error.includes('Backend server is not available') && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(120, 113, 108, 0.2)',
          border: '1px solid rgba(180, 83, 9, 0.6)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#fbbf24',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <div>
            <h3 style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '4px' }}>
              Backend Server Unavailable
            </h3>
            <p style={{ color: '#fde68a', fontSize: '14px' }}>
              The backend server is currently not available. Some features may be limited. 
              You can still view the interface and prepare contracts.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => window.location.href = '/brand/dashboard'}
              style={{
                background: 'rgba(42, 42, 42, 0.6)',
                border: '1px solid rgba(64, 64, 64, 0.8)',
                borderRadius: '10px',
                padding: '10px',
                color: '#a0a0a0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(64, 64, 64, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a0a0a0';
                e.currentTarget.style.background = 'rgba(42, 42, 42, 0.6)';
              }}
              title="Back to Dashboard"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>Contracts</h1>
              <p style={{ fontSize: '16px', color: '#a0a0a0' }}>Manage your brand partnerships and creator agreements</p>
            </div>
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
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>{calculatedStats.active}</div>
          <div style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>Active contracts</div>
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
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>{calculatedStats.pending}</div>
          <div style={{ fontSize: '14px', color: '#f59e0b', marginTop: '8px' }}>Pending contracts</div>
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
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>${calculatedStats.totalBudget.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#6366f1', marginTop: '8px' }}>Total budget</div>
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
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>${calculatedStats.totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#10b981', marginTop: '8px' }}>Revenue generated</div>
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

          {/* Advanced Filters Toggle */}
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              padding: '12px 16px',
              background: showAdvancedFilters ? 'rgba(99, 102, 241, 0.2)' : 'rgba(42, 42, 42, 0.6)',
              border: showAdvancedFilters ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: showAdvancedFilters ? '#6366f1' : '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Filter size={16} />
            Advanced Filters
          </button>

          {/* Quick Actions */}
          <button 
            onClick={handleImport}
            style={{
              padding: '12px 16px',
              background: 'rgba(42, 42, 42, 0.6)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(42, 42, 42, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(42, 42, 42, 0.6)'}
          >
            <Upload size={16} />
            Import
          </button>

          <button 
            onClick={handleExport}
            style={{
              padding: '12px 16px',
              background: 'rgba(42, 42, 42, 0.6)',
              border: '1px solid rgba(42, 42, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(42, 42, 42, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(42, 42, 42, 0.6)'}
          >
            <Download size={16} />
            Export
          </button>

          <button 
            onClick={() => {
              setSelectedContractForAI(undefined);
              setShowAIAssistant(true);
            }}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}
          >
            <TrendingUp size={16} />
            AI Assistant
          </button>

          <button 
            onClick={() => setShowSmartGenerator(true)}
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'}
          >
            <Wand2 size={16} />
            Smart Generator
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={handleAdvancedFiltersChange}
        onClearFilters={handleClearAdvancedFilters}
        isOpen={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

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
                  {contract.creator_id.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    {contract.contract_title || `Contract ${contract.id.slice(0, 8)}`}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#a0a0a0' }}>
                    Creator: {contract.creator_id} • Brand: {contract.brand_id}
                  </p>
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

            {/* Contract Type and Status */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Type</span>
                <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {contract.contract_type}
                </span>
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

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Budget</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  ${(contract.total_budget || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Status</div>
                <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {contract.status}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>Created</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {new Date(contract.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>ID</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {contract.id.slice(0, 8)}...
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
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedContractForAI(contract.id);
                  setShowAIAssistant(true);
                }}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '6px',
                  color: '#22c55e',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <TrendingUp size={14} />
                AI
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEditContract(contract);
                }}
                style={{
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
                }}
              >
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

      {/* Create Contract Modal */}
      <CreateContractModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onContractCreated={handleContractCreated}
      />

      {/* Edit Contract Modal */}
      <EditContractModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingContract(null);
        }}
        contract={editingContract}
        onContractUpdated={handleContractUpdated}
        onContractDeleted={handleContractDeleted}
      />

      {/* AI Assistant Modal */}
      <ContractAIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        selectedContractId={selectedContractForAI}
      />

      {/* Smart Contract Generator Modal */}
      <SmartContractGenerator
        isOpen={showSmartGenerator}
        onClose={() => setShowSmartGenerator(false)}
        onContractGenerated={handleContractGenerated}
        currentUser={currentUserInfo}
      />
    </div>
  );
};

export default Contracts;