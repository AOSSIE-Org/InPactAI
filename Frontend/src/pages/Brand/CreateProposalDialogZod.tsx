import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Checkbox } from "../../components/ui/checkbox";
import { Progress } from "../../components/ui/progress";
import { Upload, CheckCircle } from "lucide-react";
import { proposalSchema, ProposalFormData, getStepFields } from "./proposalSchema";

interface CreateProposalDialogZodProps {
  children: React.ReactNode;
}

export function CreateProposalDialogZod({ children }: CreateProposalDialogZodProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    reset,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      brandName: "",
      campaignType: "",
      platform: "",
      budgetRange: [1000, 10000],
      duration: "1-month",
      deliverables: [],
      message: "",
      attachments: [],
      contactPreference: "email",
    },
    mode: "onChange",
  });

  const formValues = watch();
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    // Validate only the fields for the current step
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: ProposalFormData) => {
    console.log("Submitting proposal:", data);

    // Show success message
    setShowSuccess(true);

    // Reset after a delay
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
      setCurrentStep(1);
      reset();
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setValue("attachments", Array.from(e.target.files));
    }
  };

  const toggleDeliverable = (deliverable: string) => {
    const currentDeliverables = formValues.deliverables || [];
    const updatedDeliverables = currentDeliverables.includes(deliverable)
      ? currentDeliverables.filter((d) => d !== deliverable)
      : [...currentDeliverables, deliverable];
    setValue("deliverables", updatedDeliverables);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brandName">
                    Brand Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="brandName"
                    placeholder="Enter brand name"
                    {...register("brandName")}
                  />
                  {errors.brandName && (
                    <p className="text-xs text-red-500">{errors.brandName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaignType">
                    Campaign Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formValues.campaignType}
                    onValueChange={(value) => setValue("campaignType", value)}
                  >
                    <SelectTrigger id="campaignType">
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product-review">Product Review</SelectItem>
                      <SelectItem value="sponsored-post">Sponsored Post</SelectItem>
                      <SelectItem value="brand-ambassador">Brand Ambassador</SelectItem>
                      <SelectItem value="video-integration">Video Integration</SelectItem>
                      <SelectItem value="event-coverage">Event Coverage</SelectItem>
                      <SelectItem value="giveaway">Giveaway Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.campaignType && (
                    <p className="text-xs text-red-500">{errors.campaignType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">
                    Platform <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formValues.platform}
                    onValueChange={(value) => setValue("platform", value)}
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="multi-platform">Multi-Platform</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.platform && (
                    <p className="text-xs text-red-500">{errors.platform.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Campaign Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>
                    Budget Range (USD) <span className="text-red-500">*</span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={formValues.budgetRange}
                      onValueChange={(value) => setValue("budgetRange", value as [number, number])}
                      min={500}
                      max={50000}
                      step={500}
                      minStepsBetweenThumbs={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Min: ${formValues.budgetRange[0].toLocaleString()}</span>
                    <span>Max: ${formValues.budgetRange[1].toLocaleString()}</span>
                  </div>
                  {errors.budgetRange && (
                    <p className="text-xs text-red-500">{errors.budgetRange.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    Campaign Duration <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formValues.duration}
                    onValueChange={(value: string) => setValue("duration", value)}
                  >
                    {["1-month", "3-months", "6-months", "12-months", "ongoing"].map(
                      (duration) => (
                        <div key={duration} className="flex items-center space-x-2">
                          <RadioGroupItem value={duration} id={duration} />
                          <Label htmlFor={duration} className="font-normal cursor-pointer">
                            {duration === "ongoing"
                              ? "Ongoing Partnership"
                              : duration.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  {errors.duration && (
                    <p className="text-xs text-red-500">{errors.duration.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    Deliverables <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    {[
                      "Instagram Posts",
                      "Instagram Stories",
                      "YouTube Video",
                      "TikTok Video",
                      "Blog Article",
                      "Product Unboxing",
                      "Tutorial/How-To",
                      "Live Stream",
                      "Reels/Shorts",
                    ].map((deliverable) => (
                      <div key={deliverable} className="flex items-center space-x-2">
                        <Checkbox
                          id={deliverable}
                          checked={formValues.deliverables?.includes(deliverable)}
                          onCheckedChange={() => toggleDeliverable(deliverable)}
                        />
                        <Label
                          htmlFor={deliverable}
                          className="font-normal cursor-pointer"
                        >
                          {deliverable}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.deliverables && (
                    <p className="text-xs text-red-500">{errors.deliverables.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Proposal Message */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="message">
                    Proposal Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Write a compelling pitch explaining why you're the perfect fit for this campaign..."
                    {...register("message")}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Mention your audience demographics, engagement rates, and previous
                    successful campaigns (min. 50 characters)
                  </p>
                  {errors.message && (
                    <p className="text-xs text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <Input
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="attachments"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload media kit, portfolio, or analytics
                      </span>
                      <span className="text-xs text-gray-400">
                        PDF, PNG, JPG up to 10MB each
                      </span>
                    </label>
                  </div>
                  {formValues.attachments && formValues.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {formValues.attachments.map((file, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          📎 {file.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup
                    value={formValues.contactPreference}
                    onValueChange={(value: string) => setValue("contactPreference", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="font-normal cursor-pointer">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="platform-chat" id="platform-chat" />
                      <Label
                        htmlFor="platform-chat"
                        className="font-normal cursor-pointer"
                      >
                        Platform Chat
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="phone" />
                      <Label htmlFor="phone" className="font-normal cursor-pointer">
                        Phone Call
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.contactPreference && (
                    <p className="text-xs text-red-500">
                      {errors.contactPreference.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Submit Proposal
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
