import {
  SquareTerminal,
} from "lucide-react"
import { checkUser } from "@/lib/auth"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { MainHead } from "./main-head"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavGroup } from "./nav-group"

const data = {
  single:[
    {
      title: "Dashboard",
      icon: SquareTerminal,
      url:"/",
    }
  ],
  navMain: [
    {
      title: "Notes",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Notes Summarizer",
          url: "/notes",
        },
      ],
    },
  ],
}

export async function AppSidebar({ ...props }) {
  const user = await checkUser()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <MainHead/>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={data.single}/>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
