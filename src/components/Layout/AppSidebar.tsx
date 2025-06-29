import { Home, ShoppingBag, Package, Users, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasPermission } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      permission: 'dashboard' as const,
    },
    {
      title: 'PDV',
      url: '/pdv',
      icon: ShoppingBag,
      permission: 'pdv' as const,
    },
    {
      title: 'Pedidos',
      url: '/orders',
      icon: Package,
      permission: 'orders' as const,
    },
    {
      title: 'Estoque',
      url: '/stock',
      icon: Package,
      permission: 'stock' as const,
    },
    {
      title: 'Clientes',
      url: '/customers',
      icon: Users,
      permission: 'users' as const,
    },
    {
      title: 'Usuários',
      url: '/users',
      icon: Users,
      permission: 'users' as const,
    },
  ]

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Y</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">You Fashion</h1>
            <p className="text-sm text-sidebar-foreground/70">& Style</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full justify-start"
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="flex items-center space-x-3 w-full text-left"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/70">{user?.role}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
