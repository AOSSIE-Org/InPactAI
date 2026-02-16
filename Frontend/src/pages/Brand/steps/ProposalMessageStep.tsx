import React from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Upload } from "lucide-react";
import { useProposal } from "../ProposalContext";

export function ProposalMessageStep() {
  const { formData, updateField } = useProposal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateField("attachments", Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="message">
          Proposal Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          placeholder="Write a compelling pitch explaining why you're the perfect fit for this campaign..."
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          Tip: Mention your audience demographics, engagement rates, and previous
          successful campaigns (min. 50 characters)
        </p>
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
        {formData.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {formData.attachments.map((file, index) => (
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
          value={formData.contactPreference}
          onValueChange={(value: string) => updateField("contactPreference", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="email" />
            <Label htmlFor="email" className="font-normal cursor-pointer">
              Email
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="platform-chat" id="platform-chat" />
            <Label htmlFor="platform-chat" className="font-normal cursor-pointer">
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
      </div>
    </div>
  );
}
