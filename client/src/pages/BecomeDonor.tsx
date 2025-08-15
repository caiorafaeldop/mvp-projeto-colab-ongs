import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, CreditCard, Shield, Users, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { createDonorSubscription } from '@/api/donations'

export function BecomeDonor() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [donorData, setDonorData] = useState({
    name: '',
    email: '',
    phone: '',
    document: ''
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const predefinedAmounts = [
    { value: '25', label: 'R$ 25' },
    { value: '50', label: 'R$ 50' },
    { value: '100', label: 'R$ 100' },
    { value: '200', label: 'R$ 200' }
  ]

  const frequencies = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ]

  const getFinalAmount = () => {
    return selectedAmount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(selectedAmount) || 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!donorData.name || !donorData.email || !getFinalAmount() || !agreedToTerms) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e aceite os termos",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const subscriptionData = {
        ...donorData,
        amount: getFinalAmount(),
        frequency,
        currency: 'BRL'
      }

      const response = await createDonorSubscription(subscriptionData)
      toast({
        title: "Sucesso!",
        description: "Sua assinatura foi criada! Redirecionando para o pagamento...",
      })
      
      // In a real app, redirect to Stripe checkout
      setTimeout(() => {
        navigate('/donor-dashboard')
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar assinatura",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/donations')}
          className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Torne-se um Doador</CardTitle>
            <CardDescription>
              Sua contribuição recorrente ajuda a manter nossa casa de apoio funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={donorData.name}
                      onChange={(e) => setDonorData({...donorData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={donorData.email}
                      onChange={(e) => setDonorData({...donorData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={donorData.phone}
                      onChange={(e) => setDonorData({...donorData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">CPF</Label>
                    <Input
                      id="document"
                      placeholder="000.000.000-00"
                      value={donorData.document}
                      onChange={(e) => setDonorData({...donorData, document: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Donation Amount */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Valor da Doação</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {predefinedAmounts.map(amount => (
                    <Button
                      key={amount.value}
                      type="button"
                      variant={selectedAmount === amount.value ? "default" : "outline"}
                      onClick={() => setSelectedAmount(amount.value)}
                      className="h-12"
                    >
                      {amount.label}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="custom"
                    checked={selectedAmount === 'custom'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAmount('custom')
                      } else {
                        setSelectedAmount('')
                        setCustomAmount('')
                      }
                    }}
                  />
                  <Label htmlFor="custom">Outro valor</Label>
                </div>

                {selectedAmount === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customAmount">Valor personalizado (R$)</Label>
                    <Input
                      id="customAmount"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="0,00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Frequency */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Frequência</h3>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              {getFinalAmount() > 0 && (
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Sua doação:</span>
                      <span className="text-xl font-bold text-pink-600">
                        R$ {getFinalAmount().toFixed(2)} / {frequency === 'monthly' ? 'mês' : frequency === 'quarterly' ? 'trimestre' : 'ano'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  Concordo com os termos de uso e política de privacidade. Entendo que posso cancelar minha assinatura a qualquer momento.
                </Label>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm text-green-700 dark:text-green-300">
                  <strong>Pagamento seguro:</strong> Processado via Stripe com criptografia SSL
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !getFinalAmount() || !agreedToTerms}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isLoading ? "Processando..." : "Continuar para Pagamento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Impact Section */}
        <Card className="mt-8 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Seu Impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-pink-600">R$ 25</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  1 dia de alimentação para uma mulher
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">R$ 50</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  1 sessão de apoio psicológico
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">R$ 100</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  1 dia completo de hospedagem
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}