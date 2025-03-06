import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Copy, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const templates = [
  {
    id: "sponsorship",
    title: "Brand Sponsorship",
    description: "Standard agreement for sponsored content with brands",
    features: ["Payment terms", "Content requirements", "Approval process", "Usage rights", "Exclusivity clauses"],
  },
  {
    id: "collaboration",
    title: "Creator Collaboration",
    description: "Agreement for collaborating with other creators",
    features: ["Revenue sharing", "Content ownership", "Cross-promotion", "Creative control", "Termination clauses"],
  },
  {
    id: "affiliate",
    title: "Affiliate Partnership",
    description: "Agreement for affiliate marketing relationships",
    features: ["Commission structure", "Tracking methods", "Payment schedule", "Promotional guidelines", "Term length"],
  },
  {
    id: "licensing",
    title: "Content Licensing",
    description: "License your content to brands or platforms",
    features: ["Usage rights", "Licensing fees", "Term limitations", "Attribution requirements", "Territorial rights"],
  },
  {
    id: "longterm",
    title: "Long-term Partnership",
    description: "Extended partnership with brands or creators",
    features: [
      "Multi-phase deliverables",
      "Performance metrics",
      "Renewal terms",
      "Escalating compensation",
      "Exit clauses",
    ],
  },
  {
    id: "oneoff",
    title: "One-off Project",
    description: "Simple agreement for a single content piece",
    features: ["Single payment", "Limited deliverables", "Quick turnaround", "Minimal obligations", "Simple terms"],
  },
]

export function ContractTemplates() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleUseTemplate = (templateId) => {
    setSelectedTemplate(templateId)
    // In a real app, this would navigate to a contract creation page with the template pre-loaded
    router.push(`/dashboard/contracts/create?template=${templateId}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className={selectedTemplate === template.id ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                {template.title}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => console.log(`Duplicating ${template.id}`)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button size="sm" onClick={() => handleUseTemplate(template.id)}>
                Use Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

