import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useCustomHooks'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useLocalStorage('cart', [])

  const addItem = useCallback((menuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === menuItem.id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      
      return [...prevItems, { ...menuItem, quantity: 1 }]
    })
  }, [setItems])

  const removeItem = useCallback((itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }, [setItems])

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    )
  }, [setItems, removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [setItems])

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  )
  
  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  }), [items, addItem, removeItem, updateQuantity, clearCart, total, itemCount])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
