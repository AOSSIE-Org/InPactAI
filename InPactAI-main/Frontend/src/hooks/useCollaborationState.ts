import { useReducer, useCallback } from 'react';

// Types
export interface FilterState {
  niche: string;
  audienceSize: string;
  collaborationType: string;
  location: string;
}

export interface ModalState {
  newCollaboration: boolean;
  aiSearch: boolean;
}

export interface CollaborationState {
  modals: ModalState;
  filters: FilterState;
}

// Action Types
export type CollaborationAction =
  | { type: 'OPEN_MODAL'; modal: keyof ModalState }
  | { type: 'CLOSE_MODAL'; modal: keyof ModalState }
  | { type: 'UPDATE_FILTER'; filter: keyof FilterState; value: string }
  | { type: 'RESET_FILTERS' }
  | { type: 'RESET_ALL' };

// Initial State
const initialState: CollaborationState = {
  modals: {
    newCollaboration: false,
    aiSearch: false,
  },
  filters: {
    niche: 'all',
    audienceSize: 'all',
    collaborationType: 'all',
    location: 'all',
  },
};

// Reducer Function
function collaborationReducer(
  state: CollaborationState,
  action: CollaborationAction
): CollaborationState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modal]: true,
        },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modal]: false,
        },
      };

    case 'UPDATE_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filter]: action.value,
        },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };

    case 'RESET_ALL':
      return initialState;

    default:
      return state;
  }
}

// Custom Hook
export function useCollaborationState() {
  const [state, dispatch] = useReducer(collaborationReducer, initialState);

  // Modal Actions
  const openModal = useCallback((modal: keyof ModalState) => {
    dispatch({ type: 'OPEN_MODAL', modal });
  }, []);

  const closeModal = useCallback((modal: keyof ModalState) => {
    dispatch({ type: 'CLOSE_MODAL', modal });
  }, []);

  const openNewCollaborationModal = useCallback(() => {
    openModal('newCollaboration');
  }, [openModal]);

  const closeNewCollaborationModal = useCallback(() => {
    closeModal('newCollaboration');
  }, [closeModal]);

  const openAiSearchModal = useCallback(() => {
    openModal('aiSearch');
  }, [openModal]);

  const closeAiSearchModal = useCallback(() => {
    closeModal('aiSearch');
  }, [closeModal]);

  // Filter Actions
  const updateFilter = useCallback((filter: keyof FilterState, value: string) => {
    dispatch({ type: 'UPDATE_FILTER', filter, value });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  // Computed Values
  const hasActiveFilters = Object.values(state.filters).some(value => value !== 'all');
  const activeFiltersCount = Object.values(state.filters).filter(value => value !== 'all').length;

  return {
    // State
    state,
    modals: state.modals,
    filters: state.filters,
    
    // Modal Actions
    openModal,
    closeModal,
    openNewCollaborationModal,
    closeNewCollaborationModal,
    openAiSearchModal,
    closeAiSearchModal,
    
    // Filter Actions
    updateFilter,
    resetFilters,
    resetAll,
    
    // Computed Values
    hasActiveFilters,
    activeFiltersCount,
  };
} 