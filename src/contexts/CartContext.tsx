
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  product_id: string
  name: string
  sku: string
  sale_price: number
  quantity: number
  stock: number
  size?: string
  color?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  getCartItemCount: () => number
  setCart: (items: CartItem[]) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCartState] = useState<CartItem[]>([])
  const { toast } = useToast()

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    console.log('🛒 Adicionando produto ao carrinho:', product)
    
    setCartState(currentCart => {
      const existingItem = currentCart.find(item => item.product_id === product.product_id)
      
      if (existingItem) {
        // Se o item já existe, incrementa a quantidade (até o limite do estoque)
        if (existingItem.quantity < product.stock) {
          const updatedCart = currentCart.map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
          
          toast({
            title: 'Quantidade atualizada',
            description: `${product.name} - Quantidade: ${existingItem.quantity + 1}`,
          })
          
          return updatedCart
        } else {
          toast({
            title: 'Estoque insuficiente',
            description: `Não é possível adicionar mais ${product.name}. Estoque: ${product.stock}`,
            variant: 'destructive'
          })
          return currentCart
        }
      } else {
        // Se é um novo item, adiciona com quantidade 1
        const newItem: CartItem = {
          ...product,
          id: `${product.product_id}-${Date.now()}`,
          quantity: 1
        }
        
        toast({
          title: 'Produto adicionado',
          description: `${product.name} foi adicionado ao carrinho`,
        })
        
        return [...currentCart, newItem]
      }
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartState(currentCart =>
      currentCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.min(quantity, item.stock)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const removeFromCart = (itemId: string) => {
    setCartState(currentCart => currentCart.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setCartState([])
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const setCart = (items: CartItem[]) => {
    setCartState(items)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemCount,
        setCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
