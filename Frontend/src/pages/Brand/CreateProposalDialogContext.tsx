import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { CheckCircle } from "lucide-react";
import { ProposalProvider, useProposal } from "./ProposalContext";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { CampaignDetailsStep } from "./steps/CampaignDetailsStep";
import { ProposalMessageStep } from "./steps/ProposalMessageStep";

interface CreateProposalDialogContextProps {
  children: React.ReactNode;
}

function DialogContent_Internal() {
  const { currentStep, totalSteps, nextStep, prevStep, resetForm, validateStep } =
    useProposal();
  const [showSuccess, setShowSuccess] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleSubmit = () => {
    const { isValid, errors } = validateStep(currentStep);
    if (!isValid) {
      alert(errors.join("\n"));
      return;
    }

    // Here you would typically send the data to your API
    console.log("Submitting proposal");

    // Show success message
    setShowSuccess(true);

    // Reset after a delay
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <CampaignDetailsStep />;
      case 3:
        return <ProposalMessageStep />;
      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Sponsorship Proposal</DialogTitle>
        <DialogDescription>
          Step {currentStep} of {totalSteps}: Complete the form to submit your proposal
        </DialogDescription>
      </DialogHeader>

      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold">Proposal Submitted Successfully!</h3>
          <p className="text-gray-600 text-center">
            Your proposal has been sent. The brand will review it shortly.
          </p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Render Current Step */}
          {renderStep()}

          {/* Navigation Footer */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Submit Proposal
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export function CreateProposalDialogContext({
  children,
}: CreateProposalDialogContextProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <ProposalProvider>
          <DialogContent_Internal />
        </ProposalProvider>
      </DialogContent>
    </Dialog>
  );
}
