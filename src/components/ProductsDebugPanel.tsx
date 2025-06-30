
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Database, User } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function ProductsDebugPanel() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isTestingAuth, setIsTestingAuth] = useState(false)
  const [isTestingRLS, setIsTestingRLS] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [rlsStatus, setRlsStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [debugInfo, setDebugInfo] = useState<string>('')

  const testConnection = async () => {
    setIsTestingConnection(true)
    setDebugInfo('')
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      if (error) {
        setConnectionStatus('error')
        setDebugInfo(`Erro de conectividade: ${error.message}`)
      } else {
        setConnectionStatus('success')
        setDebugInfo('Conectividade com Supabase OK')
      }
    } catch (error) {
      setConnectionStatus('error')
      setDebugInfo(`Erro de rede: ${error}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const testAuthentication = async () => {
    setIsTestingAuth(true)
    setDebugInfo('')
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setAuthStatus('error')
        setDebugInfo(`Erro de autenticação: ${error.message}`)
      } else if (user) {
        setAuthStatus('success')
        setDebugInfo(`Usuário autenticado: ${user.email}`)
      } else {
        setAuthStatus('error')
        setDebugInfo('Usuário não autenticado')
      }
    } catch (error) {
      setAuthStatus('error')
      setDebugInfo(`Erro ao verificar autenticação: ${error}`)
    } finally {
      setIsTestingAuth(false)
    }
  }

  const testRLS = async () => {
    setIsTestingRLS(true)
    setDebugInfo('')
    
    try {
      // Teste básico de RLS
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, status')
        .limit(3)
      
      if (error) {
        setRlsStatus('error')
        setDebugInfo(`Erro de RLS: ${error.message}`)
      } else {
        setRlsStatus('success')
        setDebugInfo(`RLS OK - ${products?.length || 0} produtos acessíveis`)
      }
    } catch (error) {
      setRlsStatus('error')
      setDebugInfo(`Erro ao testar RLS: ${error}`)
    } finally {
      setIsTestingRLS(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />OK</Badge>
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>
      default:
        return <Badge variant="outline">Não testado</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Diagnóstico de Produtos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conectividade</span>
              {getStatusBadge(connectionStatus)}
            </div>
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              size="sm"
              className="w-full"
            >
              {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autenticação</span>
              {getStatusBadge(authStatus)}
            </div>
            <Button
              onClick={testAuthentication}
              disabled={isTestingAuth}
              size="sm"
              className="w-full"
            >
              {isTestingAuth ? 'Verificando...' : 'Verificar Auth'}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RLS</span>
              {getStatusBadge(rlsStatus)}
            </div>
            <Button
              onClick={testRLS}
              disabled={isTestingRLS}
              size="sm"
              className="w-full"
            >
              {isTestingRLS ? 'Testando...' : 'Testar RLS'}
            </Button>
          </div>
        </div>

        {debugInfo && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-mono">{debugInfo}</p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Use este painel para diagnosticar problemas de conectividade, autenticação e políticas RLS.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
