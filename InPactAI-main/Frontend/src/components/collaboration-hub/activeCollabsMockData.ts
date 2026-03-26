// MOCK DATA: This will be replaced by functioning backend logic later on

export const activeCollabsMock = [
  {
    id: 1,
    collaborator: {
      name: "GadgetGuru",
      avatar: "/placeholder.svg?height=96&width=96",
      contentType: "Unboxing & First Impressions"
    },
    collabTitle: "Unboxing Marathon",
    status: "In Progress",
    startDate: "2024-06-01",
    dueDate: "2024-06-15",
    messages: 12,
    deliverables: { completed: 2, total: 3 },
    lastActivity: "2 days ago",
    latestUpdate: "Finalizing thumbnail for the main video."
  },
  {
    id: 2,
    collaborator: {
      name: "TechTalker",
      avatar: "/placeholder.svg?height=96&width=96",
      contentType: "Tech News & Commentary"
    },
    collabTitle: "Tech for Good",
    status: "Awaiting Response",
    startDate: "2024-06-05",
    dueDate: "2024-06-20",
    messages: 5,
    deliverables: { completed: 0, total: 2 },
    lastActivity: "5 days ago",
    latestUpdate: "Waiting for approval on the script."
  },
  {
    id: 3,
    collaborator: {
      name: "StyleStar",
      avatar: "/placeholder.svg?height=96&width=96",
      contentType: "Fashion & Lifestyle"
    },
    collabTitle: "Style Swap Challenge",
    status: "Completed",
    startDate: "2024-05-10",
    dueDate: "2024-05-25",
    messages: 18,
    deliverables: { completed: 2, total: 2 },
    lastActivity: "1 day ago",
    latestUpdate: "Collab video published and shared on socials."
  }
]; 