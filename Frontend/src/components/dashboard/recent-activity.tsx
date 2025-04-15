import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://via.placeholder.com/36" alt="Avatar" />
          <AvatarFallback>BF</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Beauty Fusion</p>
          <p className="text-sm text-muted-foreground">Sent you a sponsorship proposal</p>
          <p className="text-xs text-muted-foreground">2 hours ago</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://via.placeholder.com/36" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Jane Doe</p>
          <p className="text-sm text-muted-foreground">Accepted your collaboration request</p>
          <p className="text-xs text-muted-foreground">5 hours ago</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://via.placeholder.com/36" alt="Avatar" />
          <AvatarFallback>TS</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">TechStart</p>
          <p className="text-sm text-muted-foreground">Contract signed and finalized</p>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://via.placeholder.com/36" alt="Avatar" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Inpact AI</p>
          <p className="text-sm text-muted-foreground">New sponsorship matches available</p>
          <p className="text-xs text-muted-foreground">2 days ago</p>
        </div>
      </div>
    </div>
  )
}

