import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Calendar, User } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { getProductById, contactSeller } from '@/api/marketplace'

export function ProductDetail() {
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isContacting, setIsContacting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const response = await getProductById(id)
      setProduct(response.product)
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar produto",
        variant: "destructive",
      })
      navigate('/marketplace')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSeller = async () => {
    try {
      setIsContacting(true)
      const response = await contactSeller({ productId: id })
      toast({
        title: "Sucesso!",
        description: "Contato enviado! O vendedor receberá sua mensagem.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao entrar em contato",
        variant: "destructive",
      })
    } finally {
      setIsContacting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getConditionLabel = (condition) => {
    const conditions = {
      'new': 'Novo',
      'like-new': 'Seminovo',
      'good': 'Bom estado',
      'fair': 'Estado regular'
    }
    return conditions[condition] || condition
  }

  const getCategoryLabel = (category) => {
    const categories = {
      'electronics': 'Eletrônicos',
      'clothing': 'Roupas',
      'home': 'Casa e Jardim',
      'books': 'Livros',
      'sports': 'Esportes',
      'others': 'Outros'
    }
    return categories[category] || category
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Produto não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            Voltar ao Marketplace
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace')}
          className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
              <div className="relative h-96">
                <img
                  src={product.images[currentImageIndex] || '/placeholder-image.jpg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex
                            ? 'bg-white'
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold mb-2">
                      {product.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">
                        {getCategoryLabel(product.category)}
                      </Badge>
                      <Badge variant="outline">
                        {getConditionLabel(product.condition)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {product.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{product.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Publicado em {formatDate(product.createdAt)}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{product.seller?.name || 'Vendedor'}</p>
                      <p className="text-sm text-gray-500">
                        Membro desde {formatDate(product.seller?.createdAt || product.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleContactSeller}
                    disabled={isContacting}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isContacting ? "Enviando..." : "Entrar em Contato"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}