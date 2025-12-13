import React from "react";
import { Label } from "../../../components/ui/label";
import { Slider } from "../../../components/ui/slider";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Checkbox } from "../../../components/ui/checkbox";
import { useProposal } from "../ProposalContext";

export function CampaignDetailsStep() {
  const { formData, updateField } = useProposal();

  const toggleDeliverable = (deliverable: string) => {
    const updatedDeliverables = formData.deliverables.includes(deliverable)
      ? formData.deliverables.filter((d) => d !== deliverable)
      : [...formData.deliverables, deliverable];
    updateField("deliverables", updatedDeliverables);
  };

  const deliverableOptions = [
    "Instagram Posts",
    "Instagram Stories",
    "YouTube Video",
    "TikTok Video",
    "Blog Article",
    "Product Unboxing",
    "Tutorial/How-To",
    "Live Stream",
    "Reels/Shorts",
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>
          Budget Range (USD) <span className="text-red-500">*</span>
        </Label>
        <div className="px-2">
          <Slider
            value={formData.budgetRange}
            onValueChange={(value) => updateField("budgetRange", value)}
            min={500}
            max={50000}
            step={500}
            minStepsBetweenThumbs={1}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Min: ${formData.budgetRange[0].toLocaleString()}</span>
          <span>Max: ${formData.budgetRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>
          Campaign Duration <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.duration}
          onValueChange={(value: string) => updateField("duration", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1-month" id="1-month" />
            <Label htmlFor="1-month" className="font-normal cursor-pointer">
              1 Month
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3-months" id="3-months" />
            <Label htmlFor="3-months" className="font-normal cursor-pointer">
              3 Months
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="6-months" id="6-months" />
            <Label htmlFor="6-months" className="font-normal cursor-pointer">
              6 Months
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="12-months" id="12-months" />
            <Label htmlFor="12-months" className="font-normal cursor-pointer">
              12 Months
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ongoing" id="ongoing" />
            <Label htmlFor="ongoing" className="font-normal cursor-pointer">
              Ongoing Partnership
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>
          Deliverables <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-2">
          {deliverableOptions.map((deliverable) => (
            <div key={deliverable} className="flex items-center space-x-2">
              <Checkbox
                id={deliverable}
                checked={formData.deliverables.includes(deliverable)}
                onCheckedChange={() => toggleDeliverable(deliverable)}
              />
              <Label htmlFor={deliverable} className="font-normal cursor-pointer">
                {deliverable}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
