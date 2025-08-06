import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Globe, Scale, Info } from "lucide-react"

interface GoverningLawsSelectorProps {
  selectedJurisdiction: string
  onJurisdictionChange: (jurisdiction: string) => void
  selectedDisputeResolution: string
  onDisputeResolutionChange: (resolution: string) => void
  customDisputeResolution?: string
  onCustomDisputeChange?: (text: string) => void
  showDetails?: boolean
}

export function GoverningLawsSelector({
  selectedJurisdiction,
  onJurisdictionChange,
  selectedDisputeResolution,
  onDisputeResolutionChange,
  customDisputeResolution = "",
  onCustomDisputeChange,
  showDetails = true
}: GoverningLawsSelectorProps) {
  // Governing laws options
  const jurisdictions = [
    { 
      value: "california", 
      label: "California, USA", 
      laws: ["California Civil Code", "Federal Trade Commission Act", "California Consumer Privacy Act"],
      description: "Strong consumer protection laws, FTC compliance required"
    },
    { 
      value: "newyork", 
      label: "New York, USA", 
      laws: ["New York Civil Practice Law", "Federal Trade Commission Act", "New York Consumer Protection"],
      description: "Business-friendly jurisdiction with strong contract enforcement"
    },
    { 
      value: "mumbai", 
      label: "Mumbai, India", 
      laws: ["Indian Contract Act, 1872", "Information Technology Act, 2000", "Consumer Protection Act, 2019"],
      description: "Comprehensive digital and consumer protection framework"
    },
    { 
      value: "london", 
      label: "London, UK", 
      laws: ["English Contract Law", "Consumer Rights Act 2015", "Data Protection Act 2018"],
      description: "Well-established contract law with strong enforcement"
    },
    { 
      value: "toronto", 
      label: "Toronto, Canada", 
      laws: ["Ontario Consumer Protection Act", "Personal Information Protection Act", "Competition Act"],
      description: "Strong privacy protection and consumer rights"
    },
    { 
      value: "singapore", 
      label: "Singapore", 
      laws: ["Singapore Contract Act", "Personal Data Protection Act", "Consumer Protection Act"],
      description: "Business-friendly with strong digital commerce laws"
    },
    { 
      value: "sydney", 
      label: "Sydney, Australia", 
      laws: ["Australian Consumer Law", "Privacy Act 1988", "Competition and Consumer Act"],
      description: "Comprehensive consumer protection and fair trading laws"
    },
    { 
      value: "custom", 
      label: "Custom Jurisdiction", 
      laws: [],
      description: "Specify your own jurisdiction and applicable laws"
    }
  ]

  const disputeResolutionOptions = [
    { 
      value: "arbitration", 
      label: "Binding Arbitration", 
      description: "Disputes resolved through arbitration",
      details: "Faster, more private, and often less expensive than court proceedings"
    },
    { 
      value: "mediation", 
      label: "Mediation", 
      description: "Disputes resolved through mediation first",
      details: "Voluntary process where a neutral mediator helps parties reach agreement"
    },
    { 
      value: "court", 
      label: "Court Proceedings", 
      description: "Disputes resolved in local courts",
      details: "Traditional legal proceedings in the jurisdiction's court system"
    },
    { 
      value: "custom", 
      label: "Custom Resolution", 
      description: "Specify custom dispute resolution",
      details: "Define your own dispute resolution procedure"
    }
  ]

  const selectedJurisdictionData = jurisdictions.find(j => j.value === selectedJurisdiction)
  const selectedDisputeData = disputeResolutionOptions.find(d => d.value === selectedDisputeResolution)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Scale className="h-5 w-5" />
          <CardTitle className="text-lg">Governing Laws & Jurisdiction</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Jurisdiction Selection */}
        <div className="space-y-3">
          <Label htmlFor="jurisdiction" className="text-base font-medium">
            Primary Jurisdiction
          </Label>
          <Select value={selectedJurisdiction} onValueChange={onJurisdictionChange}>
            <SelectTrigger id="jurisdiction" className="w-full">
              <SelectValue placeholder="Select jurisdiction" />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map((jurisdiction) => (
                <SelectItem key={jurisdiction.value} value={jurisdiction.value}>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{jurisdiction.label}</div>
                      {jurisdiction.description && (
                        <div className="text-xs text-muted-foreground">{jurisdiction.description}</div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Show applicable laws for selected jurisdiction */}
          {selectedJurisdiction && selectedJurisdiction !== "custom" && selectedJurisdictionData && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-500" />
                <Label className="text-sm font-medium text-blue-700">Applicable Laws</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedJurisdictionData.laws.map((law, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {law}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dispute Resolution Selection */}
        <div className="space-y-3">
          <Label htmlFor="dispute-resolution" className="text-base font-medium">
            Dispute Resolution Method
          </Label>
          <Select value={selectedDisputeResolution} onValueChange={onDisputeResolutionChange}>
            <SelectTrigger id="dispute-resolution" className="w-full">
              <SelectValue placeholder="Select dispute resolution method" />
            </SelectTrigger>
            <SelectContent>
              {disputeResolutionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                    {option.details && (
                      <div className="text-xs text-blue-600 mt-1">{option.details}</div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Show details for selected dispute resolution */}
          {selectedDisputeResolution && selectedDisputeData && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700">{selectedDisputeData.label}</p>
                  <p className="text-blue-600">{selectedDisputeData.details}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Dispute Resolution Input */}
        {selectedDisputeResolution === "custom" && onCustomDisputeChange && (
          <div className="space-y-2">
            <Label htmlFor="custom-dispute">Custom Dispute Resolution Procedure</Label>
            <Textarea 
              id="custom-dispute" 
              placeholder="Specify your custom dispute resolution procedure..."
              value={customDisputeResolution}
              onChange={(e) => onCustomDisputeChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about the procedure, venue, and governing rules for dispute resolution.
            </p>
          </div>
        )}

        {/* Summary Section */}
        {showDetails && selectedJurisdiction && selectedDisputeResolution && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Contract Legal Framework Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction:</span>
                <span className="font-medium">{selectedJurisdictionData?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispute Resolution:</span>
                <span className="font-medium">{selectedDisputeData?.label}</span>
              </div>
              {selectedJurisdictionData?.laws.length && (
                <div className="mt-3">
                  <span className="text-muted-foreground text-xs">Key Applicable Laws:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedJurisdictionData.laws.slice(0, 2).map((law, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {law}
                      </Badge>
                    ))}
                    {selectedJurisdictionData.laws.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedJurisdictionData.laws.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 