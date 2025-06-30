
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

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

// Helper function to map role to permissions
const getRolePermissions = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: true,
        users: true
      }
    case 'manager':
      return {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: true,
        users: false
      }
    case 'seller':
      return {
        dashboard: true,
        pdv: true,
        orders: true,
        stock: false,
        users: false
      }
    case 'cashier':
      return {
        dashboard: true,
        pdv: true,
        orders: false,
        stock: false,
        users: false
      }
    default:
      return {
        dashboard: false,
        pdv: false,
        orders: false,
        stock: false,
        users: false
      }
  }
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
      console.log('Attempting login with:', { email })
      
      // Query the profiles table to find user with matching email and password
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Login error:', error)
        return false
      }

      if (!profile) {
        console.log('No matching user found')
        return false
      }

      console.log('User found:', profile)

      // Convert profile to User format
      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        status: profile.status as 'active' | 'blocked',
        role: profile.role || 'seller',
        permissions: getRolePermissions(profile.role || 'seller'),
        createdAt: profile.created_at || new Date().toISOString(),
        createdBy: profile.created_by || undefined
      }

      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('Login successful for user:', userData.name)
      return true
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
