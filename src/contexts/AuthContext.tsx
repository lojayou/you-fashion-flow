
import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'blocked'
  role: string
  permissions: {
    dashboard: boolean
    pdv: boolean
    orders: boolean
    stock: boolean
    users: boolean
  }
  createdAt: string
  createdBy?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: keyof User['permissions']) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock admin user for demonstration
const mockAdminUser: User = {
  id: '1',
  name: 'Administrador',
  email: 'admin@youfashion.com',
  phone: '(11) 99999-9999',
  status: 'active',
  role: 'Administrador',
  permissions: {
    dashboard: true,
    pdv: true,
    orders: true,
    stock: true,
    users: true
  },
  createdAt: new Date().toISOString()
}

// New admin user - Geovanny
const guedesAdminUser: User = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Geovanny Guedes',
  email: 'guedesgeovanny@gmail.com',
  phone: '(11) 99999-0000',
  status: 'active',
  role: 'Administrador',
  permissions: {
    dashboard: true,
    pdv: true,
    orders: true,
    stock: true,
    users: true
  },
  createdAt: new Date().toISOString()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - check for both admin users
      if (email === 'admin@youfashion.com' && password === 'admin123') {
        setUser(mockAdminUser)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(mockAdminUser))
        return true
      }
      
      if (email === 'guedesgeovanny@gmail.com' && password === 'You1234') {
        setUser(guedesAdminUser)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(guedesAdminUser))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  const hasPermission = (permission: keyof User['permissions']): boolean => {
    return user?.permissions[permission] || false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
