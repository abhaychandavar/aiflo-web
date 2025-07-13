import settings from "@/config/app"
import Image from "next/image"
import { ReactNode } from "react"
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "next-themes"

const Sidebar = ({ children }: {
    children?: ReactNode
}) => {
    const { theme } = useTheme()
    const logoSrc = theme === 'dark' ? '/aiflo-light.svg' : '/aiflo-dark.svg'

    return <div className="w-fit h-full border-r border-border flex flex-col justify-between">
    <div className="flex flex-col gap-5">
      <div className="p-4  flex items-center">
        <div className="rounded-md mr-2">
          <Image 
            alt='aiflo'
            src={logoSrc}
            height={32}
            width={32}
          />
        </div>
        <h1>{settings.brandName}</h1>
      </div>
      {
        children ? <div className="p-4 flex flex-col gap-2 items-start">{children}</div> : <></>
      }
    </div>
    <div className="p-4 border-t border-border space-y-4">
      <ThemeToggle />
      <div className="flex items-center space-x-2">
        <div className="rounded-full w-8 h-8 flex items-center justify-center">
          M
        </div>
        <div>
          <p className="text-sm font-medium">User</p>
        </div>
      </div>
    </div>
  </div>
}

export default Sidebar;