import React from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useProposal } from "../ProposalContext";

export function BasicInfoStep() {
  const { formData, updateField } = useProposal();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="brandName">
          Brand Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="brandName"
          placeholder="Enter brand name"
          value={formData.brandName}
          onChange={(e) => updateField("brandName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaignType">
          Campaign Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.campaignType}
          onValueChange={(value) => updateField("campaignType", value)}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">
          Platform <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.platform}
          onValueChange={(value) => updateField("platform", value)}
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
      </div>
    </div>
  );
}
