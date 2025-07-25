import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Calculator,
  CreditCard,
  Calendar as CalendarIcon
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CustomerSearch } from '@/components/CustomerSearch'
import { QuickProductAdd } from '@/components/QuickProductAdd'
import { supabase } from '@/integrations/supabase/client'
import { useCart } from '@/contexts/CartContext'

interface PaymentMethod {
  type: string
  amount: number
}

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

export default function PDV() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isConditional, setIsConditional] = useState(false)
  const [conditionalDate, setConditionalDate] = useState<Date>()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [discount, setDiscount] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)
  const [observations, setObservations] = useState('')
  const [customPaymentType, setCustomPaymentType] = useState('')
  const { toast } = useToast()

  // Helper function to format currency input
  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except dots and commas
    const numericValue = value.replace(/[^\d,]/g, '')
    
    // Convert to number for formatting
    const number = parseFloat(numericValue.replace(',', '.')) || 0
    
    return number
  }

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatCurrency(inputValue)
    setAmountPaid(formattedValue)
  }

  const addPaymentMethod = () => {
    if (customPaymentType && amountPaid > 0) {
      const newPayment: PaymentMethod = {
        type: customPaymentType,
        amount: amountPaid
      }
      setPaymentMethods([...paymentMethods, newPayment])
      setCustomPaymentType('')
      setAmountPaid(0)
    }
  }

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const getPaymentMethodLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'money': 'Dinheiro',
      'credit': 'Cartão de Crédito',
      'debit': 'Cartão de Débito',
      'pix': 'PIX'
    }
    return labels[type] || type
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount
  const totalPaid = paymentMethod === 'custom' 
    ? paymentMethods.reduce((sum, pm) => sum + pm.amount, 0)
    : amountPaid
  const change = totalPaid - total

  const handleCustomerCreated = (newCustomer: Customer) => {
    // Automaticamente selecionar o cliente recém-cadastrado
    setSelectedCustomer(newCustomer)
    toast({
      title: 'Cliente cadastrado e selecionado',
      description: `${newCustomer.name} foi vinculado ao pedido atual`,
    })
  }

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um item ao carrinho',
        variant: 'destructive'
      })
      return
    }

    if (isConditional && !conditionalDate) {
      toast({
        title: 'Erro',
        description: 'Informe a data prevista de devolução',
        variant: 'destructive'
      })
      return
    }

    if (!isConditional && !paymentMethod) {
      toast({
        title: 'Erro',
        description: 'Selecione a forma de pagamento',
        variant: 'destructive'
      })
      return
    }

    if (!isConditional && paymentMethod === 'custom' && paymentMethods.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma forma de pagamento',
        variant: 'destructive'
      })
      return
    }

    try {
      const orderNumber = `${isConditional ? 'COND' : 'VEND'}-${Date.now()}`
      
      if (isConditional) {
        // Salvar condicional
        const { data: conditional, error: conditionalError } = await supabase
          .from('conditionals')
          .insert({
            customer_id: selectedCustomer?.id,
            customer_name: selectedCustomer?.name || 'Cliente Avulso',
            customer_phone: selectedCustomer?.phone || '',
            total_value: total,
            due_date: conditionalDate?.toISOString().split('T')[0],
            status: 'active'
          })
          .select()
          .single()

        if (conditionalError) {
          throw conditionalError
        }

        // Salvar itens do condicional
        const conditionalItems = cart.map(item => ({
          conditional_id: conditional.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.sale_price,
          size: item.size || '',
          color: item.color || ''
        }))

        const { error: itemsError } = await supabase
          .from('conditional_items')
          .insert(conditionalItems)

        if (itemsError) {
          throw itemsError
        }

      } else {
        // Salvar venda
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            customer_id: selectedCustomer?.id,
            customer_name: selectedCustomer?.name || 'Cliente Avulso',
            customer_phone: selectedCustomer?.phone || '',
            total_amount: total,
            payment_method: paymentMethod === 'custom' 
              ? paymentMethods.map(pm => getPaymentMethodLabel(pm.type)).join(', ')
              : getPaymentMethodLabel(paymentMethod),
            status: 'confirmed'
          })
          .select()
          .single()

        if (orderError) {
          throw orderError
        }

        // Salvar itens da venda
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.sale_price,
          total_price: item.sale_price * item.quantity,
          size: item.size || '',
          color: item.color || ''
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          throw itemsError
        }
      }

      toast({
        title: `${isConditional ? 'Condicional' : 'Venda'} realizada com sucesso!`,
        description: `Pedido ${orderNumber} registrado${selectedCustomer ? ` para ${selectedCustomer.name}` : ''}`,
      })

      // Reset form
      clearCart()
      setSelectedCustomer(null)
      setIsConditional(false)
      setConditionalDate(undefined)
      setPaymentMethod('')
      setPaymentMethods([])
      setDiscount(0)
      setAmountPaid(0)
      setObservations('')
      setCustomPaymentType('')

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast({
        title: 'Erro',
        description: `Erro ao processar o pedido: ${error?.message || 'Tente novamente.'}`,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">PDV - Ponto de Venda</h1>
        <p className="text-muted-foreground">Sistema de vendas e condicionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Product Add */}
        <QuickProductAdd />

        {/* Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Carrinho ({cart.length} itens)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item no carrinho. <br />
                <span className="text-sm">Use o campo de busca acima para adicionar produtos.</span>
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.sku} • R$ {item.sale_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer and Payment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSearch 
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
              onCustomerCreated={handleCustomerCreated}
            />
            
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observações sobre o pedido..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Pagamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conditional Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={isConditional}
                onCheckedChange={setIsConditional}
              />
              <Label className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Condicional</span>
              </Label>
            </div>

            {isConditional ? (
              <div className="space-y-2">
                <Label htmlFor="conditionalDate">Data de Devolução</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !conditionalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {conditionalDate ? (
                        format(conditionalDate, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={conditionalDate}
                      onSelect={setConditionalDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money">Dinheiro</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'custom' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={customPaymentType} onValueChange={setCustomPaymentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="money">Dinheiro</SelectItem>
                            <SelectItem value="credit">Cartão de Crédito</SelectItem>
                            <SelectItem value="debit">Cartão de Débito</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            value={amountPaid}
                            onChange={handleAmountPaidChange}
                            step="0.01"
                            placeholder="0,00"
                          />
                          <Button
                            size="sm"
                            onClick={addPaymentMethod}
                            disabled={!customPaymentType || amountPaid <= 0}
                            className="bg-copper-500 hover:bg-copper-600"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {paymentMethods.length > 0 && (
                      <div className="space-y-2">
                        <Label>Formas de Pagamento Adicionadas</Label>
                        <div className="space-y-2">
                          {paymentMethods.map((pm, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">
                                {getPaymentMethodLabel(pm.type)}: R$ {pm.amount.toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removePaymentMethod(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                    {/* Show "Valor Pago" only for money payment */}
                    {paymentMethod === 'money' && (
                      <div className="space-y-2">
                        <Label htmlFor="amountPaid">Valor Pago</Label>
                        <Input
                          id="amountPaid"
                          type="number"
                          value={amountPaid}
                          onChange={handleAmountPaidChange}
                          step="0.01"
                          placeholder="0,00"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary and Finalize */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-lg font-medium">R$ {subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desconto</p>
                <p className="text-lg font-medium">R$ {discountAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-copper-600">R$ {total.toFixed(2)}</p>
              </div>
              {!isConditional && totalPaid > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Troco</p>
                  <p className="text-lg font-medium">R$ {Math.max(0, change).toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="ml-6 bg-copper-500 hover:bg-copper-600 text-white px-8"
                  disabled={cart.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isConditional ? 'Registrar Condicional' : 'Finalizar Venda'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmar {isConditional ? 'Condicional' : 'Venda'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="space-y-2">
                      <p>
                        Deseja confirmar {isConditional ? 'o registro desta condicional' : 'a finalização desta venda'}?
                      </p>
                      <div className="bg-muted p-3 rounded-lg">
                        <p><strong>Cliente:</strong> {selectedCustomer?.name || 'Cliente Avulso'}</p>
                        <p><strong>Total:</strong> R$ {total.toFixed(2)}</p>
                        <p><strong>Itens:</strong> {cart.length}</p>
                        {isConditional && conditionalDate && (
                          <p><strong>Data de Devolução:</strong> {format(conditionalDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                        )}
                        {!isConditional && (
                          <p><strong>Pagamento:</strong> {
                            paymentMethod === 'custom' 
                              ? paymentMethods.map(pm => getPaymentMethodLabel(pm.type)).join(', ')
                              : getPaymentMethodLabel(paymentMethod)
                          }</p>
                        )}
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleFinalizeSale}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
