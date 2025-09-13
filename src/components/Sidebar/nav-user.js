
import { SignedIn, UserButton } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser({user}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="flex items-center space-x-2"
            >
              <div className="mt-2">
                <SignedIn>
                  <UserButton/>
                </SignedIn>
              </div>
              <div className="text-left text-sm leading-tight">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs">{user.email}</p>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
