import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Heart, Calendar, CreditCard, Settings, Download, Pause, Play, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { getDonorDashboard, updateSubscription, cancelSubscription } from '@/api/donations'

export function DonorDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const response = await getDonorDashboard()
      setDashboardData(response.dashboard)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseResume = async () => {
    try {
      const action = dashboardData.subscription.status === 'active' ? 'pause' : 'resume'
      await updateSubscription({ action })
      toast({
        title: "Sucesso!",
        description: `Assinatura ${action === 'pause' ? 'pausada' : 'reativada'} com sucesso!`,
      })
      loadDashboard()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar assinatura",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return

    try {
      await cancelSubscription()
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      })
      loadDashboard()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cancelar assinatura",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' },
      paused: { label: 'Pausada', variant: 'secondary' },
      cancelled: { label: 'Cancelada', variant: 'destructive' }
    }
    const config = statusConfig[status] || statusConfig.active
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel do Doador
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Obrigado por fazer a diferença, {dashboardData?.donor?.name}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            <span className="text-lg font-semibold text-pink-600">
              Doador Ativo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(dashboardData?.stats?.totalDonated || 0)}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Total doado
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {dashboardData?.stats?.donationCount || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Doações realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {dashboardData?.stats?.monthsActive || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Meses como doador
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Sua Assinatura
              </span>
              {getStatusBadge(dashboardData?.subscription?.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Detalhes da Doação</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">
                      {formatCurrency(dashboardData?.subscription?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequência:</span>
                    <span className="font-medium">
                      {dashboardData?.subscription?.frequency === 'monthly' ? 'Mensal' :
                       dashboardData?.subscription?.frequency === 'quarterly' ? 'Trimestral' : 'Anual'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próxima cobrança:</span>
                    <span className="font-medium">
                      {formatDate(dashboardData?.subscription?.nextBilling)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Ações</h4>
                <div className="space-y-2">
                  {dashboardData?.subscription?.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseResume}
                      className="w-full"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar Assinatura
                    </Button>
                  ) : dashboardData?.subscription?.status === 'paused' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePauseResume}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Reativar Assinatura
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Assinatura
                  </Button>

                  {dashboardData?.subscription?.status !== 'cancelled' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Doações
              </span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.donations?.map((donation, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatCurrency(donation.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(donation.date)}
                    </div>
                  </div>
                  <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                    {donation.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma doação encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}