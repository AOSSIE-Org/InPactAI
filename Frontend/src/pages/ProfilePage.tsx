import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  BarChart3,
  Briefcase,
  Camera,
  Edit,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Rocket,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabase";

export default function ProfilePage() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setEditForm({
          name: data.name || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const calculateProfileStrength = () => {
    if (!profile) return 0;
    let strength = 0;
    if (profile.bio) strength += 20;
    if (profile.avatar_url) strength += 20;
    if (profile.banner_url) strength += 20;
    if (profile.location) strength += 15;
    if (profile.website) strength += 15;
    if (profile.social_links?.length > 0) strength += 10;
    return strength;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update(editForm)
        .eq("id", user.id);

      if (!error) {
        setIsEditOpen(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const profileStrength = calculateProfileStrength();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6 ml-6">
            <Rocket className="h-6 w-6 text-primary" />
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
                className="w-9 px-0"
                asChild
              >
                <Link to={to} title={label}>
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center space-x-3">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8 md:w-[300px] rounded-full"
              />
            </div>
            <ModeToggle />
            <Button onClick={logout} variant="ghost" title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Banner & Avatar */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-500 to-blue-500">
          <div className="absolute -bottom-16 left-8 flex items-end gap-4">
            <div className="relative">
              <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || user?.email || 'User')}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
          >
            <Camera className="mr-2 h-4 w-4" />
            Change Banner
          </Button>
        </div>

        <div className="container mt-20 space-y-6 pb-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{profile.name || user?.email}</h1>
                <Badge variant="secondary">{profile.role || "Creator"}</Badge>
              </div>
              <p className="text-muted-foreground">@{profile.username || user?.email?.split('@')[0]}</p>
              <p className="text-sm max-w-2xl">{profile.bio || "No bio yet"}</p>
              {profile.location && (
                <p className="text-sm text-muted-foreground">📍 {profile.location}</p>
              )}
            </div>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="bio">Bio</label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="location">Location</label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="website">Website</label>
                    <Input
                      id="website"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Profile Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.followers || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.engagement_rate || "0"}%</div>
                <p className="text-xs text-muted-foreground">Above average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.collaborations || "0"}</div>
                <p className="text-xs text-muted-foreground">3 active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${profile.total_earnings || "0"}</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Strength */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Strength</CardTitle>
              <CardDescription>
                Complete your profile to increase visibility and get better matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{profileStrength}% Complete</span>
                  <span className="text-muted-foreground">
                    {profileStrength === 100 ? "Excellent!" : "Keep going!"}
                  </span>
                </div>
                <Progress value={profileStrength} className="h-2" />
              </div>
              {profileStrength < 100 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Suggestions to improve:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {!profile.bio && <li>• Add a bio (+20%)</li>}
                    {!profile.avatar_url && <li>• Upload a profile picture (+20%)</li>}
                    {!profile.banner_url && <li>• Add a banner image (+20%)</li>}
                    {!profile.location && <li>• Add your location (+15%)</li>}
                    {!profile.website && <li>• Add your website (+15%)</li>}
                    {(!profile.social_links || profile.social_links.length === 0) && (
                      <li>• Connect social profiles (+10%)</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="portfolio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Showcase your best work</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No items yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Track your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Analytics coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
