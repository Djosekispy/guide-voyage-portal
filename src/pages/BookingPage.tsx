import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, DollarSign, Info, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking, Booking, getTourPackage, TourPackage } from '@/lib/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BookingPage() {
  const { packageId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<TourPackage | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [groupSize, setGroupSize] = useState(1);
  const [notes, setNotes] = useState('');
  const [availableTimes] = useState(['08:00', '09:00', '10:00', '14:00', '15:00']);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadPackageData = async () => {
      try {
        setLoading(true);
        const pkg = await getTourPackage(packageId || '');
        
        // Verificar se o guia está tentando reservar seu próprio tour
        if (pkg && user && pkg.guideId === user.uid) {
          toast({
            title: 'Ação não permitida',
            description: 'Você não pode fazer reserva nos seus próprios pacotes.',
            variant: 'destructive',
          });
          navigate('/guias');
          return;
        }
        
        setPackageData(pkg);
      } catch (error) {
        console.error('Erro ao carregar pacote:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os detalhes do pacote',
          variant: 'destructive',
        });
        navigate('/guias');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      loadPackageData();
    }
  }, [packageId, navigate, toast, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData :  Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
        touristId: user.uid,
        touristName: user.displayName || 'Anônimo',
        touristEmail: user.email || '',
        guideId: packageData.guideId,
        guideName: packageData.guideName,
        packageId: packageData.id,
        packageTitle: packageData.title,
        date: format(date, 'yyyy-MM-dd'),
        city: packageData.location,
        time,
        duration: parseInt(packageData.duration.split(' ')[0]),
        totalPrice: packageData.price * groupSize,
        groupSize,
        status: 'Pendente',
        notes,
      };

      await createBooking(bookingData);
      
      toast({
        title: 'Reserva realizada!',
        description: 'Sua reserva foi enviada para o guia com sucesso',
        className: 'bg-green-500 text-white',
      });

      navigate('/turista/reservas');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível completar sua reserva',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !packageData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando detalhes do pacote...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-6 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Formulário de Reserva */}
            <div className="w-full lg:w-2/3 order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {step === 1 ? 'Selecione a Data' : 'Complete sua Reserva'}
                  </h1>
                  <div className="flex items-center gap-2 md:gap-4 mt-4 overflow-x-auto pb-2">
                    <div className={`flex items-center gap-1 md:gap-2 flex-shrink-0 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                      <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center text-xs md:text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        {step > 1 ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : '1'}
                      </div>
                      <span className="text-xs md:text-sm whitespace-nowrap">Data</span>
                    </div>
                    <div className="h-px bg-gray-200 flex-1 min-w-4"></div>
                    <div className={`flex items-center gap-1 md:gap-2 flex-shrink-0 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                      <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center text-xs md:text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        {step > 2 ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : '2'}
                      </div>
                      <span className="text-xs md:text-sm whitespace-nowrap">Detalhes</span>
                    </div>
                    <div className="h-px bg-gray-200 flex-1 min-w-4"></div>
                    <div className={`flex items-center gap-1 md:gap-2 flex-shrink-0 ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                      <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center text-xs md:text-sm ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                        3
                      </div>
                      <span className="text-xs md:text-sm whitespace-nowrap">Confirmar</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                      <div>
                        <Label className="block mb-2 text-sm md:text-base">Selecione a Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal text-sm md:text-base"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {date ? format(date, 'PPP', { locale: pt }) : <span>Escolha uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarUI
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(d) => 
                                d < new Date() || 
                                d > addDays(new Date(), 60)
                              }
                              initialFocus
                              locale={pt}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm md:text-base">Selecione o Horário</Label>
                        <Select value={time} onValueChange={setTime}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          type="button"
                          onClick={() => setStep(2)}
                          disabled={!date || !time}
                          className="w-full md:w-auto"
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                      <div>
                        <Label className="block mb-2 text-sm md:text-base">Número de Pessoas</Label>
                        <Input
                          type="number"
                          min="1"
                          max={packageData?.maxGroupSize || 10}
                          value={groupSize}
                          onChange={(e) => setGroupSize(Math.min(parseInt(e.target.value) || 1, packageData?.maxGroupSize || 10))}
                        />
                        <p className="text-xs md:text-sm text-muted-foreground mt-2">
                          Máximo: {packageData?.maxGroupSize || 10} pessoas
                        </p>
                      </div>

                      <div>
                        <Label className="block mb-2 text-sm md:text-base">Observações (Opcional)</Label>
                        <Input
                          placeholder="Alguma necessidade especial ou informação adicional?"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-3 md:gap-4 pt-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                        >
                          Voltar
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => setStep(3)}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && packageData && (
                    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                        <div className="flex items-start gap-2 md:gap-3">
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-green-800 text-sm md:text-base">Resumo da Reserva</h3>
                            <p className="text-xs md:text-sm text-green-700 mt-1">
                              Confira os detalhes antes de confirmar
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Pacote:</span>
                          <span className="font-medium text-right">{packageData.title}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-medium text-right">
                            {date ? format(date, 'PPP', { locale: pt }) : ''} às {time}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="font-medium">{packageData.duration}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Pessoas:</span>
                          <span className="font-medium">{groupSize}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Preço/pessoa:</span>
                          <span className="font-medium">
                            {packageData.price.toLocaleString('pt-AO', { 
                              style: 'currency', 
                              currency: 'AOA' 
                            })}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between gap-2">
                          <span className="text-muted-foreground font-medium">Total:</span>
                          <span className="font-bold text-base md:text-lg text-primary">
                            {(packageData.price * groupSize).toLocaleString('pt-AO', { 
                              style: 'currency', 
                              currency: 'AOA' 
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-3 md:gap-4 pt-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                        >
                          Voltar
                        </Button>
                        <Button 
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Processando...' : 'Confirmar Reserva'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Resumo do Pacote */}
            <div className="w-full lg:w-1/3 order-1 lg:order-2">
              <Card className="lg:sticky lg:top-6">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    {packageData?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                  <div className="flex items-center gap-2 md:gap-3">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Guia</p>
                      <p className="text-sm md:text-base truncate">{packageData?.guideName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Localização</p>
                      <p className="text-sm md:text-base truncate">{packageData?.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Duração</p>
                      <p className="text-sm md:text-base">{packageData?.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Preço por Pessoa</p>
                      <p className="font-bold text-sm md:text-base text-primary">
                        {packageData?.price.toLocaleString('pt-AO', { 
                          style: 'currency', 
                          currency: 'AOA' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 md:pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-sm md:text-base">
                      <Info className="h-3 w-3 md:h-4 md:w-4" />
                      O que está incluído
                    </h4>
                    <ul className="space-y-1 md:space-y-2">
                      {packageData?.includes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs md:text-sm">
                          <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}