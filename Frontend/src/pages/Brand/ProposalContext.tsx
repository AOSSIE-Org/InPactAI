import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FormData {
  brandName: string;
  campaignType: string;
  platform: string;
  budgetRange: number[];
  duration: string;
  deliverables: string[];
  message: string;
  attachments: File[];
  contactPreference: string;
}

interface ProposalContextType {
  formData: FormData;
  currentStep: number;
  totalSteps: number;
  updateField: (field: keyof FormData, value: any) => void;
  updateMultipleFields: (updates: Partial<FormData>) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetForm: () => void;
  validateStep: (step: number) => { isValid: boolean; errors: string[] };
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

const initialFormData: FormData = {
  brandName: "",
  campaignType: "",
  platform: "",
  budgetRange: [1000, 10000],
  duration: "1-month",
  deliverables: [],
  message: "",
  attachments: [],
  contactPreference: "email",
};

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.brandName.trim()) errors.push("Brand name is required");
        if (!formData.campaignType) errors.push("Campaign type is required");
        if (!formData.platform) errors.push("Platform is required");
        break;
      case 2:
        if (formData.budgetRange[0] >= formData.budgetRange[1]) {
          errors.push("Minimum budget must be less than maximum budget");
        }
        if (formData.deliverables.length === 0) {
          errors.push("Please select at least one deliverable");
        }
        break;
      case 3:
        if (!formData.message.trim()) {
          errors.push("Proposal message is required");
        }
        if (formData.message.trim().length < 50) {
          errors.push("Proposal message should be at least 50 characters");
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  const nextStep = (): boolean => {
    const { isValid, errors } = validateStep(currentStep);
    if (!isValid) {
      alert(errors.join("\n"));
      return false;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }
    return false;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return (
    <ProposalContext.Provider
      value={{
        formData,
        currentStep,
        totalSteps,
        updateField,
        updateMultipleFields,
        nextStep,
        prevStep,
        goToStep,
        resetForm,
        validateStep,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposal() {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposal must be used within a ProposalProvider");
  }
  return context;
}
