import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Search, 
  Filter, 
  Users as UsersIcon, 
  Plus,
  Edit,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Key
} from 'lucide-react'
import { User } from '@/contexts/AuthContext'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Administrador',
      email: 'admin@youfashion.com',
      phone: '(11) 99999-9999',
      status: 'active',
      role: 'Administrador',
      permissions: {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: true,
        users: true
      },
      createdAt: '2025-06-01T10:00:00',
      createdBy: 'Sistema'
    },
    {
      id: '2',
      name: 'Maria Silva',
      email: 'maria@youfashion.com',
      phone: '(11) 98888-8888',
      status: 'active',
      role: 'Gerente',
      permissions: {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: true,
        users: false
      },
      createdAt: '2025-06-02T14:30:00',
      createdBy: 'Administrador'
    },
    {
      id: '3',
      name: 'João Santos',
      email: 'joao@youfashion.com',
      phone: '(11) 97777-7777',
      status: 'active',
      role: 'Vendedor',
      permissions: {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: false,
        users: false
      },
      createdAt: '2025-06-03T16:15:00',
      createdBy: 'Administrador'
    },
    {
      id: '4',
      name: 'Ana Costa',
      email: 'ana@youfashion.com',
      phone: '(11) 96666-6666',
      status: 'blocked',
      role: 'Caixa',
      permissions: {
        dashboard: false,
        pdv: true,
        orders: false,
        stock: false,
        users: false
      },
      createdAt: '2025-06-04T09:20:00',
      createdBy: 'Administrador'
    }
  ]

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeUsers = mockUsers.filter(user => user.status === 'active')
  const blockedUsers = mockUsers.filter(user => user.status === 'blocked')
  const adminUsers = mockUsers.filter(user => user.permissions.users === true)

  const getStatusBadge = (status: User['status']) => {
    return status === 'active' ? 
      <Badge variant="secondary" className="text-green-700 bg-green-100">Ativo</Badge> : 
      <Badge variant="destructive">Bloqueado</Badge>
  }

  const getPermissionsCount = (permissions: User['permissions']) => {
    return Object.values(permissions).filter(Boolean).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gestão de usuários e permissões</p>
        </div>
        <Button className="bg-copper-500 hover:bg-copper-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
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
          <CardDescription>Gestão de usuários do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário encontrado com os filtros aplicados
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
                      <p className="font-medium">{user.phone}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Perfil</p>
                      <p className="font-medium">{user.role}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Permissões</p>
                      <p className="font-medium">{getPermissionsCount(user.permissions)} de 5</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" title="Ver detalhes">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline" title="Editar permissões">
                      <Shield className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline" title="Editar usuário">
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline" title="Redefinir senha">
                      <Key className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={user.status === 'active' ? "destructive" : "default"}
                      title={user.status === 'active' ? "Bloquear usuário" : "Desbloquear usuário"}
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

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Permissões</CardTitle>
          <CardDescription>Visão geral das permissões por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['dashboard', 'pdv', 'orders', 'stock', 'users'].map((permission) => {
              const usersWithPermission = mockUsers.filter(user => 
                user.permissions[permission as keyof User['permissions']] === true
              ).length
              
              const permissionLabels = {
                dashboard: 'Dashboard',
                pdv: 'PDV',
                orders: 'Pedidos',
                stock: 'Estoque',
                users: 'Usuários'
              }

              return (
                <div key={permission} className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {permissionLabels[permission as keyof typeof permissionLabels]}
                  </p>
                  <p className="text-2xl font-bold text-copper-600">{usersWithPermission}</p>
                  <p className="text-xs text-muted-foreground">usuários com acesso</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}