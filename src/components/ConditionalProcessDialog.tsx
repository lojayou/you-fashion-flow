import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface ConditionalProcessDialogProps {
  conditionalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface ConditionalItem {
  id: string;
  conditional_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  size?: string;
  color?: string;
}
export function ConditionalProcessDialog({
  conditionalId,
  open,
  onOpenChange
}: ConditionalProcessDialogProps) {
  const [action, setAction] = useState<'sell' | 'return' | ''>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();

  // Fetch conditional details
  const {
    data: conditional
  } = useQuery({
    queryKey: ['conditional-process', conditionalId],
    queryFn: async () => {
      if (!conditionalId) return null;
      const {
        data,
        error
      } = await supabase.from('conditionals').select('*').eq('id', conditionalId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!conditionalId && open
  });

  // Fetch conditional items
  const {
    data: items = []
  } = useQuery({
    queryKey: ['conditional-items-process', conditionalId],
    queryFn: async () => {
      if (!conditionalId) return [];
      const {
        data,
        error
      } = await supabase.from('conditional_items').select('*').eq('conditional_id', conditionalId);
      if (error) throw error;
      return data;
    },
    enabled: !!conditionalId && open
  });

  // Reset selected items when dialog opens/closes or items change
  useEffect(() => {
    if (open && items.length > 0) {
      setSelectedItems(items.map(item => item.id));
    } else if (!open) {
      setSelectedItems([]);
      setAction('');
      setPaymentMethod('');
    }
  }, [open, items]);

  // Process conditional mutation
  const processConditionalMutation = useMutation({
    mutationFn: async ({
      action,
      itemIds,
      paymentMethod
    }: {
      action: 'sell' | 'return';
      itemIds: string[];
      paymentMethod?: string;
    }) => {
      if (!conditionalId) throw new Error('ID do condicional não encontrado');
      const selectedItemsData = items.filter(item => itemIds.includes(item.id));
      const unselectedItemsData = items.filter(item => !itemIds.includes(item.id));
      const totalSelectedValue = selectedItemsData.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      if (action === 'sell') {
        if (selectedItemsData.length === 0) {
          throw new Error('Selecione pelo menos um item para finalizar a venda');
        }
        if (!paymentMethod) {
          throw new Error('Selecione uma forma de pagamento');
        }

        // Return unselected items to stock
        for (const item of unselectedItemsData) {
          const {
            data: product,
            error: productError
          } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (productError) throw productError;
          const {
            error: updateStockError
          } = await supabase.from('products').update({
            stock: (product.stock || 0) + item.quantity
          }).eq('id', item.product_id);
          if (updateStockError) throw updateStockError;
        }

        // Convert selected items to sale
        const orderNumber = `PDV-${Date.now()}`;

        // Create order
        const {
          data: newOrder,
          error: orderError
        } = await supabase.from('orders').insert({
          order_number: orderNumber,
          customer_name: conditional?.customer_name,
          customer_phone: conditional?.customer_phone,
          customer_id: conditional?.customer_id,
          total_amount: totalSelectedValue,
          status: 'confirmed',
          payment_method: paymentMethod
        }).select().single();
        if (orderError) throw orderError;

        // Create order items from selected conditional items
        const orderItems = selectedItemsData.map(item => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
          size: item.size,
          color: item.color
        }));
        const {
          error: itemsError
        } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Remove all items from conditional (both selected and unselected)
        const {
          error: deleteError
        } = await supabase.from('conditional_items').delete().eq('conditional_id', conditionalId);
        if (deleteError) throw deleteError;

        // Mark conditional as sold
        const {
          error: updateError
        } = await supabase.from('conditionals').update({
          status: 'sold'
        }).eq('id', conditionalId);
        if (updateError) throw updateError;
      } else if (action === 'return') {
        if (selectedItemsData.length === 0) {
          throw new Error('Selecione pelo menos um item para devolver');
        }

        // Return selected items to stock
        for (const item of selectedItemsData) {
          const {
            data: product,
            error: productError
          } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (productError) throw productError;
          const {
            error: updateStockError
          } = await supabase.from('products').update({
            stock: (product.stock || 0) + item.quantity
          }).eq('id', item.product_id);
          if (updateStockError) throw updateStockError;
        }

        // Remove selected items from conditional
        const {
          error: deleteError
        } = await supabase.from('conditional_items').delete().in('id', itemIds);
        if (deleteError) throw deleteError;

        // Check if there are remaining items
        const remainingItems = items.filter(item => !itemIds.includes(item.id));
        if (remainingItems.length === 0) {
          // No remaining items, mark conditional as returned
          const {
            error: updateError
          } = await supabase.from('conditionals').update({
            status: 'returned'
          }).eq('id', conditionalId);
          if (updateError) throw updateError;
        } else {
          // Update conditional total value with remaining items
          const remainingValue = remainingItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
          const {
            error: updateError
          } = await supabase.from('conditionals').update({
            total_value: remainingValue
          }).eq('id', conditionalId);
          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: (_, variables) => {
      const selectedItemsData = items.filter(item => variables.itemIds.includes(item.id));
      const unselectedItemsData = items.filter(item => !variables.itemIds.includes(item.id));
      let message = '';
      if (variables.action === 'sell') {
        if (unselectedItemsData.length > 0) {
          message = `Venda finalizada! ${selectedItemsData.length} item(s) vendido(s) e ${unselectedItemsData.length} item(s) devolvido(s) ao estoque.`;
        } else {
          message = 'Condicional finalizada como venda com sucesso!';
        }
      } else {
        const remainingItems = items.filter(item => !variables.itemIds.includes(item.id));
        if (remainingItems.length > 0) {
          message = `${selectedItemsData.length} item(s) devolvido(s) ao estoque! ${remainingItems.length} item(s) permanecem na condicional.`;
        } else {
          message = 'Condicional marcada como devolvida com sucesso!';
        }
      }
      toast({
        title: 'Sucesso!',
        description: message
      });
      queryClient.invalidateQueries({
        queryKey: ['orders']
      });
      queryClient.invalidateQueries({
        queryKey: ['conditionals']
      });
      queryClient.invalidateQueries({
        queryKey: ['products']
      });
      onOpenChange(false);
      setAction('');
      setSelectedItems([]);
      setPaymentMethod('');
    },
    onError: error => {
      toast({
        title: 'Erro',
        description: 'Erro ao processar condicional: ' + error.message,
        variant: 'destructive'
      });
    }
  });
  const handleProcess = () => {
    if (!action || selectedItems.length === 0) return;
    if (action === 'sell' && !paymentMethod) {
      toast({
        title: 'Erro',
        description: 'Selecione uma forma de pagamento',
        variant: 'destructive'
      });
      return;
    }
    processConditionalMutation.mutate({
      action,
      itemIds: selectedItems,
      paymentMethod
    });
  };
  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };
  if (!conditional) return null;
  const isOverdue = conditional.due_date && new Date(conditional.due_date) < new Date();
  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const unselectedItemsData = items.filter(item => !selectedItems.includes(item.id));
  const selectedTotal = selectedItemsData.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const unselectedTotal = unselectedItemsData.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Processar Condicional #{conditional.id.slice(0, 8)}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Condicional</Badge>
              {isOverdue && <Badge variant="destructive">Atrasado</Badge>}
            </div>
          </DialogTitle>
          <DialogDescription>
            Selecione os itens para processar. Você pode vender alguns itens e devolver outros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-2">Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{conditional.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{conditional.customer_phone}</p>
              </div>
            </div>
          </div>

          {/* Conditional Info */}
          <div>
            <h3 className="font-semibold mb-2">Informações da Condicional</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                <p className="font-medium">
                  {new Date(conditional.due_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total Original</p>
                <p className="font-medium text-lg text-blue-600">
                  R$ {Number(conditional.total_value).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                  {isOverdue ? 'Atrasado' : 'Ativo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Itens ({selectedItems.length} de {items.length} selecionados)</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedItems.length === items.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sel.</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Variações</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => <TableRow key={item.id} className={selectedItems.includes(item.id) ? 'bg-copper-50/20 border-copper-200' : ''}>
                    <TableCell>
                      <Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => handleItemToggle(item.id)} />
                    </TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.size && <Badge variant="outline" className="text-xs">{item.size}</Badge>}
                        {item.color && <Badge variant="outline" className="text-xs">{item.color}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.unit_price).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(item.unit_price * item.quantity).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>

            {selectedItems.length > 0 && <div className="mt-4 space-y-3">
                <div className="p-4 bg-copper-50/30 border border-copper-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total dos Itens Selecionados:</span>
                    <span className="text-lg font-bold text-copper-600">
                      R$ {selectedTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                    </span>
                  </div>
                </div>
                
                {action === 'sell' && unselectedItemsData.length > 0 && <div className="p-4 bg-orange-50/30 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Itens que voltarão ao estoque:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {unselectedItemsData.length} item(s) - R$ {unselectedTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2
                  })}
                      </span>
                    </div>
                  </div>}
              </div>}
          </div>

          {/* Action Selection */}
          <div>
            <h3 className="font-semibold mb-2">Ação para Itens Selecionados</h3>
            <Select value={action} onValueChange={(value: 'sell' | 'return') => setAction(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sell">Finalizar como Venda</SelectItem>
                <SelectItem value="return">Marcar como Devolvida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method for Sales */}
          {action === 'sell' && <div>
              <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>}

          {/* Sale Summary */}
          {action === 'sell' && selectedItems.length > 0 && <div className="p-4 bg-green-50/30 border border-green-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-400">Resumo da Venda</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Itens vendidos:</span>
                  <span>{selectedItemsData.length} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor da venda:</span>
                  <span className="font-medium">R$ {selectedTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}</span>
                </div>
                {unselectedItemsData.length > 0 && <div className="flex justify-between text-orange-600">
                    <span>Itens devolvidos ao estoque:</span>
                    <span>{unselectedItemsData.length} item(s)</span>
                  </div>}
                {paymentMethod && <div className="flex justify-between">
                    <span>Forma de pagamento:</span>
                    <span className="font-medium">{paymentMethod}</span>
                  </div>}
              </div>
            </div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleProcess} disabled={!action || selectedItems.length === 0 || processConditionalMutation.isPending || action === 'sell' && !paymentMethod} className={action === 'sell' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
            {processConditionalMutation.isPending ? 'Processando...' : action === 'sell' ? `Vender ${selectedItems.length} Item(s)` : action === 'return' ? `Devolver ${selectedItems.length} Item(s)` : 'Processar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}