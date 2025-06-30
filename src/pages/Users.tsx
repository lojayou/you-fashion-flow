
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Users as UsersIcon, 
  Edit,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Key,
  Loader2
} from 'lucide-react'
import { useUsers, useUpdateUserStatus, UserProfile } from '@/hooks/useUsers'
import { CreateUserDialog } from '@/components/CreateUserDialog'
import { UserViewDialog } from '@/components/UserViewDialog'
import { EditUserDialog } from '@/components/EditUserDialog'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data: users = [], isLoading, error } = useUsers()
  const updateStatusMutation = useUpdateUserStatus()

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm))
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeUsers = users.filter(user => user.status === 'active')
  const blockedUsers = users.filter(user => user.status === 'blocked')
  const adminUsers = users.filter(user => user.role === 'admin')

  const getStatusBadge = (status: UserProfile['status']) => {
    return status === 'active' ? 
      <Badge variant="secondary" className="text-green-700 bg-green-100">Ativo</Badge> : 
      <Badge variant="destructive">Bloqueado</Badge>
  }

  const getRoleLabel = (role: UserProfile['role']) => {
    const roleLabels = {
      admin: 'Administrador',
      manager: 'Gerente', 
      seller: 'Vendedor',
      cashier: 'Caixa'
    }
    return roleLabels[role] || role
  }

  const handleToggleStatus = async (userId: string, currentStatus: 'active' | 'blocked') => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    await updateStatusMutation.mutateAsync({ userId, status: newStatus })
  }

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p className="text-lg font-semibold">Erro ao carregar usuários</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gestão de usuários e permissões</p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Bloqueados</p>
                <p className="text-2xl font-bold text-red-600">{blockedUsers.length}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-copper-200 dark:border-copper-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-copper-600">{adminUsers.length}</p>
              </div>
              <Shield className="h-8 w-8 text-copper-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Status:</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="all"
                    checked={statusFilter === 'all'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-copper-600 focus:ring-copper-600"
                  />
                  <span className="text-sm">Todos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="active"
                    checked={statusFilter === 'active'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-copper-600 focus:ring-copper-600"
                  />
                  <span className="text-sm">Ativos</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="blocked"
                    checked={statusFilter === 'blocked'}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-copper-600 focus:ring-copper-600"
                  />
                  <span className="text-sm">Bloqueados</span>
                </label>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>Usuários cadastrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {users.length === 0 
                  ? 'Nenhum usuário encontrado. Clique em "Novo Usuário" para adicionar o primeiro usuário.'
                  : 'Nenhum usuário encontrado com os filtros aplicados'
                }
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{user.phone || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Perfil</p>
                      <p className="font-medium">{getRoleLabel(user.role)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Criado em</p>
                      <p className="font-medium">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" title="Ver detalhes" onClick={() => handleViewUser(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline" title="Editar usuário" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={user.status === 'active' ? "destructive" : "default"}
                      title={user.status === 'active' ? "Bloquear usuário" : "Desbloquear usuário"}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserViewDialog 
        user={selectedUser}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <EditUserDialog 
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  )
}
