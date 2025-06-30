
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { UserProfile } from '@/hooks/useUsers'

interface UserViewDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserViewDialog({ user, open, onOpenChange }: UserViewDialogProps) {
  if (!user) return null

  const getRoleLabel = (role: UserProfile['role']) => {
    const roleLabels = {
      admin: 'Administrador',
      manager: 'Gerente', 
      seller: 'Vendedor',
      cashier: 'Caixa'
    }
    return roleLabels[role] || role
  }

  const getStatusBadge = (status: UserProfile['status']) => {
    return status === 'active' ? 
      <Badge variant="secondary" className="text-green-700 bg-green-100">Ativo</Badge> : 
      <Badge variant="destructive">Bloqueado</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm font-medium">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Telefone</label>
            <p className="text-sm font-medium">{user.phone || 'Não informado'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Perfil</label>
            <p className="text-sm font-medium">{getRoleLabel(user.role)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Criado em</label>
              <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Atualizado em</label>
              <p className="text-sm font-medium">{new Date(user.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
