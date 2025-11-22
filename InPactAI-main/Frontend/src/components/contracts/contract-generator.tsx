import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Download, FileText, Loader2, Sparkles } from "lucide-react"

export function ContractGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)
    }, 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Contract Generator</CardTitle>
          <CardDescription>Generate a customized contract based on your specific needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-name">Contract Name</Label>
            <Input id="contract-name" placeholder="e.g., EcoStyle Sponsorship Agreement" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-type">Contract Type</Label>
            <Select defaultValue="sponsorship">
              <SelectTrigger id="contract-type">
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsorship">Brand Sponsorship</SelectItem>
                <SelectItem value="collaboration">Creator Collaboration</SelectItem>
                <SelectItem value="affiliate">Affiliate Partnership</SelectItem>
                <SelectItem value="licensing">Content Licensing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-party">Other Party Name</Label>
            <Input id="other-party" placeholder="Brand or creator name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-value">Contract Value</Label>
            <Input id="contract-value" placeholder="e.g., $3,000" />
          </div>

          <div className="space-y-2">
            <Label>Contract Duration</Label>
            <div className="pt-2">
              <Slider defaultValue={[30]} min={1} max={180} step={1} />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>1 day</span>
              <span>30 days</span>
              <span>180 days</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables</Label>
            <Textarea id="deliverables" placeholder="Describe the content or services you'll provide" rows={3} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="exclusivity" />
            <Label htmlFor="exclusivity">Include exclusivity clause</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="revisions" />
            <Label htmlFor="revisions">Include revision terms</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Contract...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Contract
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className={isGenerated ? "border-primary" : ""}>
        <CardHeader>
          <CardTitle>Generated Contract</CardTitle>
          <CardDescription>
            {isGenerated
              ? "Your AI-generated contract is ready for review"
              : "Your contract will appear here after generation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerated ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="text-lg font-semibold mb-2">EcoStyle Sponsorship Agreement</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">This Agreement is entered into as of [Date] by and between:</p>
                  <p>
                    <strong>Creator:</strong> [Your Name]
                  </p>
                  <p>
                    <strong>Brand:</strong> EcoStyle
                  </p>
                  <p className="text-muted-foreground mt-4">1. SCOPE OF SERVICES</p>
                  <p>Creator agrees to create and publish the following content:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>1 dedicated Instagram post featuring EcoStyle products</li>
                    <li>2 Instagram stories with swipe-up links</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">2. COMPENSATION</p>
                  <p>Brand agrees to pay Creator the sum of $3,000 USD for the Services.</p>
                  <p className="text-muted-foreground">Payment Schedule: 50% upon signing, 50% upon completion.</p>
                  <p className="text-muted-foreground mt-4">3. TERM</p>
                  <p>This Agreement shall commence on the Effective Date and continue for 30 days.</p>
                  <p className="text-muted-foreground mt-4">[...additional contract sections...]</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Fill out the form and click "Generate AI Contract" to create your customized agreement
              </p>
            </div>
          )}
        </CardContent>
        {isGenerated && (
          <CardFooter className="flex justify-between">
            <Button variant="outline">Edit Contract</Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Contract
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

