
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  status: 'active' | 'blocked'
  role: 'admin' | 'manager' | 'seller' | 'cashier'
  created_at: string
  created_by?: string
  updated_at: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users from database...')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log('Users fetched successfully:', data)
      return data as UserProfile[]
    }
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (userData: {
      name: string
      email: string
      phone?: string
      role: 'admin' | 'manager' | 'seller' | 'cashier'
    }) => {
      console.log('Creating new user:', userData)

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          status: 'active' as const
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'Usuário criado com sucesso!',
        description: 'O novo usuário foi adicionado ao sistema.',
      })
    },
    onError: (error: any) => {
      console.error('Error creating user:', error)
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    }
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: 'active' | 'blocked' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user status:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'Status atualizado!',
        description: 'O status do usuário foi atualizado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    }
  })
}
