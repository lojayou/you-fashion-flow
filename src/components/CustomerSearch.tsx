
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CustomerForm } from './CustomerForm'
import { supabase } from '@/integrations/supabase/client'

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

interface CustomerSearchProps {
  selectedCustomer: Customer | null
  onCustomerSelect: (customer: Customer | null) => void
  onCustomerCreated?: (customer: Customer) => void
}

export function CustomerSearch({ selectedCustomer, onCustomerSelect, onCustomerCreated }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)

  // Busca automática quando o termo de busca muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      console.log('Buscando clientes com termo:', searchTerm)
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) {
        console.error('Erro na busca:', error)
        throw error
      }
      
      console.log('Resultados encontrados:', data)
      setSearchResults(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const clearSelection = () => {
    onCustomerSelect(null)
    setSearchTerm('')
    setSearchResults([])
  }

  const handleCustomerAdded = async () => {
    setIsAddingCustomer(false)
    
    // Se há uma callback para cliente criado, buscar o cliente mais recente para retornar
    if (onCustomerCreated) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Erro ao buscar cliente recém-criado:', error)
        } else if (data && data.length > 0) {
          onCustomerCreated(data[0])
        }
      } catch (error) {
        console.error('Erro ao buscar cliente recém-criado:', error)
      }
    }
    
    // Realizar nova busca para mostrar o cliente recém-adicionado
    if (searchTerm.trim()) {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Cliente (Opcional)</Label>
        
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedCustomer.phone}
                {selectedCustomer.email && ` • ${selectedCustomer.email}`}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
            >
              Remover
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
                <DialogTrigger asChild>
                  <Button className="bg-copper-500 hover:bg-copper-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo cliente no sistema
                    </DialogDescription>
                  </DialogHeader>
                  <CustomerForm 
                    onSuccess={handleCustomerAdded}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading State */}
            {isSearching && (
              <p className="text-sm text-muted-foreground">Buscando clientes...</p>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      onCustomerSelect(customer)
                      setSearchResults([])
                      setSearchTerm('')
                    }}
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                      {customer.email && ` • ${customer.email}`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchTerm && searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
