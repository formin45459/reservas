import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, Users, BarChart3, ArrowRight, Shield, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">Sistema de Reservas</span>
              <p className="text-xs text-muted-foreground">Gestión Profesional</p>
            </div>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <a href={getLoginUrl()}>
              <Shield className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Sistema Profesional de Gestión
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Gestión de Reservas
                  <span className="block text-primary mt-2">Elegante y Eficiente</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Optimiza la administración de tus salas con un sistema completo que incluye 
                  calendario interactivo, reportes detallados y notificaciones en tiempo real.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                  <a href={getLoginUrl()}>
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Ver Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Seguro</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Disponible</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">Reservas</div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="lg:pl-12">
              <Card className="border-2 shadow-elegant-lg">
                <CardHeader className="space-y-3 pb-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Acceso al Sistema</CardTitle>
                  <CardDescription className="text-base">
                    Inicia sesión de forma segura para acceder a todas las funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Autenticación Segura</div>
                        <div className="text-sm text-muted-foreground">Protección OAuth avanzada</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Acceso Inmediato</div>
                        <div className="text-sm text-muted-foreground">Sin configuración adicional</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Gestión Completa</div>
                        <div className="text-sm text-muted-foreground">Todas las herramientas incluidas</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
                    asChild
                  >
                    <a href={getLoginUrl()}>
                      <Shield className="mr-2 h-5 w-5" />
                      Iniciar Sesión Segura
                    </a>
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Acceso disponible 24/7
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Funcionalidades Principales</h2>
            <p className="text-lg text-muted-foreground">Todo lo que necesitas para gestionar tus reservas</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Calendario Interactivo</CardTitle>
                <CardDescription className="text-base">
                  Visualiza todas las reservas en un calendario intuitivo con filtros avanzados por sala y fecha
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestión de Salas</CardTitle>
                <CardDescription className="text-base">
                  Administra salas con información completa de capacidad, tipo, disponibilidad y tarifas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Control de Clientes</CardTitle>
                <CardDescription className="text-base">
                  Gestiona información de clientes y visualiza su historial completo de reservas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Reportes Avanzados</CardTitle>
                <CardDescription className="text-base">
                  Analiza ocupación, ingresos y tendencias con gráficos interactivos y estadísticas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-elegant-lg">
            <CardContent className="p-12 text-center space-y-6">
              <div className="inline-flex h-16 w-16 rounded-full bg-primary-foreground/20 items-center justify-center mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-bold">¿Listo para optimizar tu gestión?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Únete a organizaciones que ya confían en nuestro sistema para gestionar 
                sus reservas de forma profesional y eficiente
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6 mt-4 shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <a href={getLoginUrl()}>
                  Acceder al Sistema
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sistema de Gestión de Reservas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Todos los derechos reservados. Diseñado con elegancia y profesionalismo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
