
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Customer {
  id: string
  name: string
  email?: string
  phone: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
}

interface CustomerFormProps {
  customer?: Customer | null
  onSuccess: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '+55 ',
    cpf: customer?.cpf || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    zip_code: customer?.zip_code || ''
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const saveCustomerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Remove empty fields to avoid issues
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.trim() !== '' && value.trim() !== '+55')
      )

      console.log('Salvando cliente:', cleanData)

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(cleanData)
          .eq('id', customer.id)
        
        if (error) {
          console.error('Erro ao atualizar cliente:', error)
          throw error
        }
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([cleanData])
        
        if (error) {
          console.error('Erro ao criar cliente:', error)
          throw error
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: customer ? 'Cliente atualizado' : 'Cliente cadastrado',
        description: customer ? 'Cliente foi atualizado com sucesso' : 'Cliente foi cadastrado com sucesso'
      })
      onSuccess()
    },
    onError: (error) => {
      console.error('Erro na mutação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o cliente',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || formData.phone.trim() === '+55' || formData.phone.trim() === '+55 ') {
      toast({
        title: 'Erro',
        description: 'Nome e telefone são obrigatórios',
        variant: 'destructive'
      })
      return
    }

    saveCustomerMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Garantir que sempre tenha o DDI do Brasil
      if (!value.startsWith('+55')) {
        value = '+55 ' + value.replace(/^\+55\s*/, '')
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevenir que o usuário delete o DDI
    const input = e.currentTarget
    const cursorPosition = input.selectionStart || 0
    
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 4) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nome completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onKeyDown={handlePhoneKeyDown}
            placeholder="+55 (11) 99999-9999"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Cidade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="SP"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => handleInputChange('zip_code', e.target.value)}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={saveCustomerMutation.isPending}
          className="bg-copper-500 hover:bg-copper-600"
        >
          {saveCustomerMutation.isPending ? 'Salvando...' : (customer ? 'Atualizar' : 'Cadastrar')}
        </Button>
      </div>
    </form>
  )
}
