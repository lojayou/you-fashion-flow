import { useState } from 'react'
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

interface CartItem {
  id: string
  name: string
  size: string
  color: string
  price: number
  quantity: number
}

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
  const [cart, setCart] = useState<CartItem[]>([])
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

  // Mock products for demo
  const mockProducts = [
    { id: '1', name: 'Blusa Elegante', price: 89.90, stock: 10 },
    { id: '2', name: 'Calça Jeans', price: 129.90, stock: 8 },
    { id: '3', name: 'Vestido Festa', price: 199.90, stock: 5 },
    { id: '4', name: 'Saia Midi', price: 79.90, stock: 12 }
  ]

  const addToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId)
    if (!product) return

    const newItem: CartItem = {
      id: Date.now().toString(),
      name: product.name,
      size: 'M',
      color: 'Azul',
      price: product.price,
      quantity: 1
    }

    setCart([...cart, newItem])
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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

  const handleFinalizeSale = () => {
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

    const orderNumber = Math.floor(Math.random() * 10000)

    toast({
      title: `${isConditional ? 'Condicional' : 'Venda'} realizada com sucesso!`,
      description: `Pedido #${orderNumber} registrado${selectedCustomer ? ` para ${selectedCustomer.name}` : ''}`,
    })

    // Reset form
    setCart([])
    setSelectedCustomer(null)
    setIsConditional(false)
    setConditionalDate(undefined)
    setPaymentMethod('')
    setPaymentMethods([])
    setDiscount(0)
    setAmountPaid(0)
    setObservations('')
    setCustomPaymentType('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">PDV - Ponto de Venda</h1>
        <p className="text-muted-foreground">Sistema de vendas e condicionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Produtos</span>
            </CardTitle>
            <CardDescription>Selecione produtos para adicionar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {product.price.toFixed(2)} • Estoque: {product.stock}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product.id)}
                    className="bg-copper-500 hover:bg-copper-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Carrinho ({cart.length} itens)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum item no carrinho
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
                        {item.color} • {item.size} • R$ {item.price.toFixed(2)}
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
                            onChange={(e) => setAmountPaid(Number(e.target.value))}
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
                    <div className="space-y-2">
                      <Label htmlFor="amountPaid">Valor Pago</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        step="0.01"
                      />
                    </div>
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
            
            <Button
              onClick={handleFinalizeSale}
              className="ml-6 bg-copper-500 hover:bg-copper-600 text-white px-8"
              disabled={cart.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isConditional ? 'Registrar Condicional' : 'Finalizar Venda'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
