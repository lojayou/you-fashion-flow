
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.status === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Indisponível</h1>
          <p className="text-muted-foreground">
            Sua conta foi bloqueada. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <div className="flex items-center space-x-3">
                  <img 
                    src="/lovable-uploads/5f0da134-62cd-41f1-ab2f-bf0c4bc61aa4.png" 
                    alt="You Fashion & Style" 
                    className="h-8 w-auto filter drop-shadow-sm"
                  />
                  <div className="text-sm text-muted-foreground">
                    Sistema de Gestão
                  </div>
                </div>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
