import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"

export function SponsorshipMatches() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://via.placeholder.com/48" alt="EcoStyle" />
              <AvatarFallback>ES</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">EcoStyle</h4>
                <Badge className="ml-2">98% Match</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Sustainable fashion brand looking for lifestyle creators</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium">$3,000 - $5,000</span>
                <span className="mx-2">•</span>
                <span>1 post, 2 stories</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://via.placeholder.com/48" alt="TechGadgets" />
              <AvatarFallback>TG</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">TechGadgets</h4>
                <Badge className="ml-2">95% Match</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tech company seeking reviewers for new smart home products
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium">$2,500 - $4,000</span>
                <span className="mx-2">•</span>
                <span>Review video + social posts</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://via.placeholder.com/48" alt="FitLife" />
              <AvatarFallback>FL</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">FitLife Supplements</h4>
                <Badge className="ml-2">92% Match</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Fitness supplement brand looking for health & wellness creators
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium">$1,800 - $3,500</span>
                <span className="mx-2">•</span>
                <span>3-month campaign</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm">View Details</Button>
                <Button size="sm" variant="outline">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

