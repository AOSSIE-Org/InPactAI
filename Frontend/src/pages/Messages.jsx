import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  BarChart3,
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Search,
  Send,
  Users,
} from "lucide-react"
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { ModeToggle } from "../components/mode-toggle"
import { UserNav } from "../components/user-nav"
import { ScrollArea } from "../components/ui/scroll-area"
import { Separator } from "../components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"

const contacts = [
  {
    id: "1",
    name: "EcoStyle",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "ES",
    lastMessage: "Let's discuss the contract details for our upcoming campaign.",
    time: "10:30 AM",
    unread: true,
    type: "brand",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SJ",
    lastMessage: "I'm excited about our travel vlog collaboration!",
    time: "Yesterday",
    unread: true,
    type: "creator",
  },
  {
    id: "3",
    name: "TechGadgets",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "TG",
    lastMessage: "We've shipped the products for your review. You should receive them by tomorrow.",
    time: "Yesterday",
    unread: false,
    type: "brand",
  },
  {
    id: "4",
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MC",
    lastMessage: "I've shared the draft script for our tech comparison video.",
    time: "2 days ago",
    unread: false,
    type: "creator",
  },
  {
    id: "5",
    name: "FitLife Supplements",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "FL",
    lastMessage: "Would you be interested in a 3-month partnership?",
    time: "3 days ago",
    unread: false,
    type: "brand",
  },
  {
    id: "6",
    name: "Leila Ahmed",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LA",
    lastMessage: "Let's schedule our fashion lookbook shoot for next week.",
    time: "1 week ago",
    unread: false,
    type: "creator",
  },
]

const messages = [
  {
    id: "1",
    sender: "user",
    content: "Hi EcoStyle team! I'm excited about our potential partnership.",
    time: "10:15 AM",
  },
  {
    id: "2",
    sender: "contact",
    content:
      "Hello! We're thrilled to work with you too. We love your content and think you'd be a perfect fit for our sustainable fashion line.",
    time: "10:18 AM",
  },
  {
    id: "3",
    sender: "user",
    content:
      "That's great to hear! I've been a fan of your brand for a while and appreciate your commitment to sustainability.",
    time: "10:20 AM",
  },
  {
    id: "4",
    sender: "contact",
    content:
      "Thank you! We've been following your content and your audience aligns perfectly with our target demographic. We'd like to discuss a potential sponsorship for our new summer collection.",
    time: "10:22 AM",
  },
  {
    id: "5",
    sender: "user",
    content: "I'd be very interested in that. What kind of deliverables are you looking for?",
    time: "10:25 AM",
  },
  {
    id: "6",
    sender: "contact",
    content:
      "We're thinking about 1 dedicated post and 2 stories highlighting our sustainable materials and production process. We'd also love if you could share your authentic experience with our products.",
    time: "10:28 AM",
  },
  {
    id: "7",
    sender: "contact",
    content:
      "Let's discuss the contract details for our upcoming campaign. We can use Inpact's AI contract generator to streamline the process.",
    time: "10:30 AM",
  },
]

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState(contacts[0])
  const [messageInput, setMessageInput] = useState("")
  const [activeMessages, setActiveMessages] = useState(messages)
  const [activeTab, setActiveTab] = useState("all")

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return

    const newMessage = {
      id: String(activeMessages.length + 1),
      sender: "user",
      content: messageInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setActiveMessages([...activeMessages, newMessage])
    setMessageInput("")
  }

  const filteredContacts = activeTab === "all" ? contacts : contacts.filter((contact) => contact.type === activeTab)

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6  ml-6">
            <Rocket className="h-6 w-6 text-[hsl(262.1,83.3%,57.8%)]" />
            <span className="font-bold text-xl hidden md:inline-block">Inpact</span>
          </Link>
          <div className="flex items-center space-x-4">
  {[
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/sponsorships", icon: Briefcase, label: "Sponsorships" },
    { to: "/dashboard/collaborations", icon: Users, label: "Collaborations" },
    { to: "/dashboard/contracts", icon: FileText, label: "Contracts" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  ].map(({ to, icon: Icon, label }) => (
    <Button
      key={to}
      variant="ghost"
      size="sm"
      className="w-9 px-0 hover:bg-[hsl(210,40%,96.1%)] hover:text-[hsl(222.2,47.4%,11.2%)]"
      asChild
    >
      <Link to={to}>
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  ))}
</div>
<div className="ml-auto flex items-center space-x-4">
  <div className="relative hidden md:flex">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(215.4,16.3%,46.9%)]" />
    <Input
      type="search"
      placeholder="Search..."
      className="w-[200px] pl-8 md:w-[300px] rounded-full bg-[hsl(210,40%,96.1%)] border-[hsl(214.3,31.8%,91.4%)]"
    />
  </div>
  <ModeToggle />
  <UserNav />
</div>
        </div>
      </header>
      <main className="flex-1 flex">
  {/* Sidebar */}
  <div className="w-full md:w-175 border-r flex flex-col bg-white dark:bg-gray-900">
    {/* Search Input */}
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search messages..."
          className="pl-10 py-2 w-full bg-gray-100 dark:bg-gray-800 border rounded-md focus:ring focus:ring-blue-300"
        />
      </div>
    </div>

    {/* Tabs Section */}
    <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
      <div className="px-4 py-2">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="all" className="text-gray-900">All</TabsTrigger>
          <TabsTrigger value="brand" className="text-gray-900">Brands</TabsTrigger>
          <TabsTrigger value="creator" className="text-gray-900">Creators</TabsTrigger>
        </TabsList>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredContacts.map((contact) => (
            <div key={contact.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start px-2 py-3 rounded-md transition duration-200 ${
                  activeContact.id === contact.id
                    ? "bg-gray-200 dark:bg-gray-800"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => setActiveContact(contact)}
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{contact.name}</span>
                      <span className="text-xs text-gray-500">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread && <Badge className="ml-2 h-2 w-2 rounded-full bg-red-500 p-0" />}
                </div>
              </Button>
              <Separator className="my-2" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </Tabs>
  </div>

  {/* Chat Section */}
  <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
    {/* Chat Header */}
    <div className="p-4 border-b flex items-center justify-between bg-white dark:bg-gray-800">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
          <AvatarFallback>{activeContact.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{activeContact.name}</h2>
          <p className="text-xs text-gray-500">
            {activeContact.type === "brand" ? "Brand Partner" : "Creator"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          View Profile
        </Button>
        <Button variant="outline" size="sm">
          Create Contract
        </Button>
      </div>
    </div>

    {/* Messages Area */}
    <ScrollArea className="flex-5 p-8">
      <div className="space-y-8">
      {activeMessages.map((message) => (
        <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[75%] p-3 rounded-lg shadow-md ${
              message.sender === "user"
                ? "bg-purple-700 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white"
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs mt-1 opacity-70">{message.time}</p>
          </div>
        </div>
      ))}
      </div>
    </ScrollArea>

    {/* Message Input */}
    <div className="p-4 border-t bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 focus:ring focus:ring-purple-300"
        />
        <Button size="icon" onClick={handleSendMessage} className="bg-purple-700 hover:bg-purple-600 text-white">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</main>

    </div>
  )
}

