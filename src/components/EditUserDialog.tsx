
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserProfile, useUpdateUser } from '@/hooks/useUsers'

interface EditUserDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as 'admin' | 'manager' | 'seller' | 'cashier',
    password: ''
  })

  const updateUserMutation = useUpdateUser()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: ''
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.name || !formData.email || !formData.role) {
      return
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role
      }

      // Só inclui a senha se foi preenchida
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      await updateUserMutation.mutateAsync({
        userId: user.id,
        userData: updateData
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome Completo *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Digite o email"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-phone">Telefone</Label>
            <Input
              id="edit-phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="edit-password">Nova Senha</Label>
            <Input
              id="edit-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Deixe em branco para manter a atual"
            />
          </div>

          <div>
            <Label htmlFor="edit-role">Perfil *</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="seller">Vendedor</SelectItem>
                <SelectItem value="cashier">Caixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateUserMutation.isPending}
              className="bg-copper-500 hover:bg-copper-600"
            >
              {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
