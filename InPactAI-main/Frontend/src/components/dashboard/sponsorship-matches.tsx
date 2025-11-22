import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"

interface SponsorshipMatch {
  sponsorship_id: string;
  match_score: number;
  title?: string;
  description?: string;
  budget?: number;
  // Add more fields as needed
}

interface SponsorshipMatchesProps {
  creatorId: string;
}

export function SponsorshipMatches({ creatorId }: SponsorshipMatchesProps) {
  const [matches, setMatches] = useState<SponsorshipMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/match/brands-for-creator/${creatorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      })
      .then((data) => {
        setMatches(data.matches || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [creatorId]);

  if (!creatorId) return <div>Login to see your matches.</div>;
  if (loading) return <div>Loading matches...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (matches.length === 0) return <div>No matching brand campaigns found.</div>;

  return (
    <div className="space-y-4">
      {matches.map((sponsorship) => (
        <Card key={sponsorship.sponsorship_id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={"https://via.placeholder.com/48"} alt={sponsorship.title || sponsorship.sponsorship_id} />
                <AvatarFallback>{(sponsorship.title || "BR").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{sponsorship.title || "Brand Campaign"}</h4>
                  <Badge className="ml-2">{Math.round((sponsorship.match_score / 4) * 100)}% Match</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {sponsorship.description || "No description provided."}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">${sponsorship.budget ?? "-"}</span>
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
      ))}
    </div>
  )
}

