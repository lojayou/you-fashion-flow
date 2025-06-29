
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  created_at: string
}

interface CustomerExportProps {
  customers: Customer[]
}

export function CustomerExport({ customers }: CustomerExportProps) {
  const { toast } = useToast()

  const exportCustomers = () => {
    if (customers.length === 0) {
      toast({
        title: 'Nenhum cliente para exportar',
        description: 'Não há clientes cadastrados para exportar',
        variant: 'destructive'
      })
      return
    }

    const csvHeaders = [
      'Nome',
      'Telefone',
      'Email',
      'CPF',
      'Endereço',
      'Cidade',
      'Estado',
      'CEP',
      'Data de Cadastro'
    ]

    const csvData = customers.map(customer => [
      customer.name,
      customer.phone,
      customer.email || '',
      customer.cpf || '',
      customer.address || '',
      customer.city || '',
      customer.state || '',
      customer.zip_code || '',
      new Date(customer.created_at).toLocaleDateString('pt-BR')
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast({
      title: 'Lista exportada',
      description: `${customers.length} clientes exportados com sucesso`
    })
  }

  return (
    <Button 
      variant="outline" 
      onClick={exportCustomers}
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Exportar Lista
    </Button>
  )
}
