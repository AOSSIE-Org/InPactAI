import React from 'react'

// MOCK DATA: This will be replaced by functioning backend logic later on
export const mockCreatorMatches = [
  {
    id: 1,
    name: "TechReviewer",
    avatar: "https://via.placeholder.com/96",
    contentType: "Tech Reviews & Tutorials",
    matchPercentage: 98,
    audienceMatch: "Very High",
    followers: "1.2M",
    engagement: "4.8%",
    content: "Tech Reviews",
    collabs: 12,
    whyMatch: [
      "Complementary content styles",
      "85% audience demographic overlap",
      "Similar engagement patterns"
    ]
  },
  {
    id: 2,
    name: "GadgetGuru",
    avatar: "https://via.placeholder.com/96",
    contentType: "Unboxing & First Impressions",
    matchPercentage: 92,
    audienceMatch: "High",
    followers: "850K",
    engagement: "5.2%",
    content: "Unboxing",
    collabs: 8,
    whyMatch: [
      "Your reviews + their unboxings = perfect combo",
      "78% audience demographic overlap",
      "Different posting schedules (opportunity)"
    ]
  },
  {
    id: 3,
    name: "TechTalker",
    avatar: "https://via.placeholder.com/96",
    contentType: "Tech News & Commentary",
    matchPercentage: 87,
    audienceMatch: "Good",
    followers: "1.5M",
    engagement: "3.9%",
    content: "Tech News",
    collabs: 15,
    whyMatch: [
      "Their news + your reviews = full coverage",
      "65% audience demographic overlap",
      "Complementary content calendars"
    ]
  }
];

function CreatorCollaborations() {
  return (
    <div>creator-collaborations</div>
  )
}

export default CreatorCollaborations