const API_BASE_URL = 'http://localhost:8000/api';

export interface Contract {
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
}

export interface ContractTemplate {
  id: string;
  template_name: string;
  template_type: string;
  industry?: string;
  terms_template?: any;
  payment_terms_template?: any;
  deliverables_template?: any;
  created_by?: string;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  milestone_name: string;
  description?: string;
  due_date: string;
  payment_amount: number;
  status: string;
  completion_criteria?: any;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  contract_id: string;
  deliverable_type: string;
  description?: string;
  platform: string;
  requirements?: any;
  due_date: string;
  status: string;
  content_url?: string;
  approval_status: string;
  approval_notes?: string;
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  milestone_id?: string;
  amount: number;
  payment_type: string;
  status: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  transaction_id?: string;
  payment_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  contract_id: string;
  user_id: string;
  comment: string;
  comment_type: string;
  is_internal: boolean;
  parent_comment_id?: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  contract_id: string;
  performance_metrics?: any;
  engagement_data?: any;
  revenue_generated: number;
  roi_percentage: number;
  cost_per_engagement: number;
  cost_per_click: number;
  recorded_at: string;
}

export interface Notification {
  id: string;
  contract_id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ContractStats {
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  draft_contracts: number;
  total_budget: number;
  average_contract_value: number;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 0) {
        throw new Error('Backend server is not available. Please try again later.');
      }
      if (response.status >= 500) {
        // Try to get more specific error information
        try {
          const errorData = await response.json();
          throw new Error(`Server error: ${errorData.detail || response.statusText}`);
        } catch {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend server is not available. Please try again later.');
    }
    throw error;
  }
}

// Contract CRUD Operations
export const contractsApi = {
  // Get all contracts with optional filtering
  getContracts: async (params?: {
    brand_id?: string;
    creator_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Contract[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/contracts${queryString ? `?${queryString}` : ''}`;
    return apiCall<Contract[]>(endpoint);
  },

  // Get a specific contract
  getContract: async (contractId: string): Promise<Contract> => {
    return apiCall<Contract>(`/contracts/${contractId}`);
  },

  // Create a new contract
  createContract: async (contractData: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> => {
    return apiCall<Contract>('/contracts', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  },

  // Update a contract
  updateContract: async (contractId: string, updateData: Partial<Contract>): Promise<Contract> => {
    return apiCall<Contract>(`/contracts/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a contract
  deleteContract: async (contractId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/${contractId}`, {
      method: 'DELETE',
    });
  },

  // Search contracts
  searchContracts: async (params: {
    query: string;
    brand_id?: string;
    creator_id?: string;
    status?: string;
    limit?: number;
  }): Promise<Contract[]> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiCall<Contract[]>(`/contracts/search?${searchParams.toString()}`);
  },

  // Get contract statistics
  getContractStats: async (params?: {
    brand_id?: string;
    creator_id?: string;
  }): Promise<ContractStats> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/contracts/stats/overview${queryString ? `?${queryString}` : ''}`;
    return apiCall<ContractStats>(endpoint);
  },
};

// Contract Templates API
export const contractTemplatesApi = {
  // Get all templates
  getTemplates: async (params?: {
    template_type?: string;
    industry?: string;
    is_public?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ContractTemplate[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/contracts/templates${queryString ? `?${queryString}` : ''}`;
    return apiCall<ContractTemplate[]>(endpoint);
  },

  // Get a specific template
  getTemplate: async (templateId: string): Promise<ContractTemplate> => {
    return apiCall<ContractTemplate>(`/contracts/templates/${templateId}`);
  },

  // Create a new template
  createTemplate: async (templateData: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<ContractTemplate> => {
    return apiCall<ContractTemplate>('/contracts/templates', {
      method: 'POST',
      body: JSON.stringify({ ...templateData, user_id: userId }),
    });
  },
};

// Milestones API
export const milestonesApi = {
  // Get milestones for a contract
  getMilestones: async (contractId: string): Promise<Milestone[]> => {
    return apiCall<Milestone[]>(`/contracts/${contractId}/milestones`);
  },

  // Create a milestone
  createMilestone: async (contractId: string, milestoneData: Omit<Milestone, 'id' | 'contract_id' | 'created_at' | 'updated_at'>): Promise<Milestone> => {
    return apiCall<Milestone>(`/contracts/${contractId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  },

  // Update a milestone
  updateMilestone: async (milestoneId: string, updateData: Partial<Milestone>): Promise<Milestone> => {
    return apiCall<Milestone>(`/contracts/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a milestone
  deleteMilestone: async (milestoneId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  },
};

// Deliverables API
export const deliverablesApi = {
  // Get deliverables for a contract
  getDeliverables: async (contractId: string): Promise<Deliverable[]> => {
    return apiCall<Deliverable[]>(`/contracts/${contractId}/deliverables`);
  },

  // Create a deliverable
  createDeliverable: async (contractId: string, deliverableData: Omit<Deliverable, 'id' | 'contract_id' | 'created_at' | 'updated_at'>): Promise<Deliverable> => {
    return apiCall<Deliverable>(`/contracts/${contractId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(deliverableData),
    });
  },

  // Update a deliverable
  updateDeliverable: async (deliverableId: string, updateData: Partial<Deliverable>): Promise<Deliverable> => {
    return apiCall<Deliverable>(`/contracts/deliverables/${deliverableId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a deliverable
  deleteDeliverable: async (deliverableId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/deliverables/${deliverableId}`, {
      method: 'DELETE',
    });
  },
};

// Payments API
export const paymentsApi = {
  // Get payments for a contract
  getPayments: async (contractId: string): Promise<Payment[]> => {
    return apiCall<Payment[]>(`/contracts/${contractId}/payments`);
  },

  // Create a payment
  createPayment: async (contractId: string, paymentData: Omit<Payment, 'id' | 'contract_id' | 'created_at' | 'updated_at'>, milestoneId?: string): Promise<Payment> => {
    return apiCall<Payment>(`/contracts/${contractId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ ...paymentData, milestone_id: milestoneId }),
    });
  },

  // Update a payment
  updatePayment: async (paymentId: string, updateData: Partial<Payment>): Promise<Payment> => {
    return apiCall<Payment>(`/contracts/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete a payment
  deletePayment: async (paymentId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },
};

// Comments API
export const commentsApi = {
  // Get comments for a contract
  getComments: async (contractId: string): Promise<Comment[]> => {
    return apiCall<Comment[]>(`/contracts/${contractId}/comments`);
  },

  // Create a comment
  createComment: async (contractId: string, commentData: Omit<Comment, 'id' | 'contract_id' | 'created_at'>, userId: string): Promise<Comment> => {
    return apiCall<Comment>(`/contracts/${contractId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ ...commentData, user_id: userId }),
    });
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsApi = {
  // Get analytics for a contract
  getAnalytics: async (contractId: string): Promise<Analytics[]> => {
    return apiCall<Analytics[]>(`/contracts/${contractId}/analytics`);
  },

  // Create analytics entry
  createAnalytics: async (contractId: string, analyticsData: Omit<Analytics, 'id' | 'contract_id' | 'recorded_at'>): Promise<Analytics> => {
    return apiCall<Analytics>(`/contracts/${contractId}/analytics`, {
      method: 'POST',
      body: JSON.stringify(analyticsData),
    });
  },
};

// Notifications API
export const notificationsApi = {
  // Get notifications for a contract
  getNotifications: async (contractId: string, userId?: string): Promise<Notification[]> => {
    const searchParams = new URLSearchParams();
    if (userId) {
      searchParams.append('user_id', userId);
    }
    
    const queryString = searchParams.toString();
    const endpoint = `/contracts/${contractId}/notifications${queryString ? `?${queryString}` : ''}`;
    return apiCall<Notification[]>(endpoint);
  },

  // Mark notification as read
  markNotificationRead: async (notificationId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/contracts/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },
}; 