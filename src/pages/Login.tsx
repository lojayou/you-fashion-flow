import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo(a) ao You Fashion & Style',
        })
        navigate('/dashboard')
      } else {
        toast({
          title: 'Erro no login',
          description: 'Email ou senha incorretos',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-fashion-cream/20 to-copper-50/30 p-4">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <img 
              src="/lovable-uploads/5f0da134-62cd-41f1-ab2f-bf0c4bc61aa4.png" 
              alt="You Fashion & Style" 
              className="h-24 w-auto mx-auto filter drop-shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-copper-400 to-copper-600 opacity-20 rounded-lg"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Sistema de Gestão de Loja</p>
        </div>

        <Card className="shadow-2xl border-copper-200 dark:border-copper-800">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-copper-600 to-copper-800 bg-clip-text text-transparent">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-copper-200 focus:border-copper-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-copper-200 focus:border-copper-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center mb-2">
                <strong>Credenciais de demonstração:</strong>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Email: admin@youfashion.com<br />
                Senha: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}