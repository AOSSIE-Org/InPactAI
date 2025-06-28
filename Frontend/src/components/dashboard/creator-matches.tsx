import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface CreatorMatch {
  user_id: string;
  match_score: number;
  audience_age_group?: Record<string, number>;
  audience_location?: Record<string, number>;
  engagement_rate?: number;
  average_views?: number;
  price_expectation?: number;
  // Add more fields as needed
}

interface CreatorMatchesProps {
  sponsorshipId: string;
}

export function CreatorMatches({ sponsorshipId }: CreatorMatchesProps) {
  const [matches, setMatches] = useState<CreatorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sponsorshipId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/match/creators-for-brand/${sponsorshipId}`)
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
  }, [sponsorshipId]);

  if (!sponsorshipId) return <div>Select a campaign to see matches.</div>;
  if (loading) return <div>Loading matches...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (matches.length === 0) return <div>No matching creators found.</div>;

  return (
    <div className="space-y-4">
      {matches.map((creator) => (
        <Card key={creator.user_id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={"https://via.placeholder.com/48"} alt={creator.user_id} />
                <AvatarFallback>{creator.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Creator {creator.user_id.slice(0, 6)}</h4>
                  <Badge className="ml-2">{Math.round((creator.match_score / 4) * 100)}% Match</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Engagement: {creator.engagement_rate ?? "-"}% | Avg Views: {creator.average_views ?? "-"}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium">${creator.price_expectation ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm">View Profile</Button>
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
  );
} 