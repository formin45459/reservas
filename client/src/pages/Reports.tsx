import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, DollarSign, Calendar, Download } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { es } from "date-fns/locale";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const { data: occupancyData, isLoading: loadingOccupancy } = trpc.reports.roomOccupancy.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: statusData, isLoading: loadingStatus } = trpc.reports.bookingStatus.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: revenueData, isLoading: loadingRevenue } = trpc.reports.revenue.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const totalRevenue = useMemo(() => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, item) => sum + parseFloat(item.revenue || "0"), 0);
  }, [revenueData]);

  const totalBookings = useMemo(() => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, item) => sum + item.bookings, 0);
  }, [revenueData]);

  const mostUsedRoom = useMemo(() => {
    if (!occupancyData || occupancyData.length === 0) return null;
    return occupancyData.reduce((max, room) => 
      room.totalBookings > (max?.totalBookings || 0) ? room : max
    , occupancyData[0]);
  }, [occupancyData]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(new Date(startDate), 1);
    setStartDate(format(startOfMonth(newDate), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(newDate), "yyyy-MM-dd"));
  };

  const handleNextMonth = () => {
    const newDate = new Date(startDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setStartDate(format(startOfMonth(newDate), "yyyy-MM-dd"));
    setEndDate(format(endOfMonth(newDate), "yyyy-MM-dd"));
  };

  const statusChartData = statusData?.map((item) => ({
    name: item.status === "pending" ? "Pendiente" :
          item.status === "confirmed" ? "Confirmada" :
          item.status === "completed" ? "Completada" : "Cancelada",
    value: item.count,
  })) || [];

  const occupancyChartData = occupancyData?.map((item) => ({
    name: item.roomName || "Sin nombre",
    reservas: item.totalBookings,
    horas: item.totalHours,
    ingresos: parseFloat(item.totalRevenue || "0"),
  })) || [];

  const revenueChartData = revenueData?.map((item) => ({
    fecha: format(new Date(item.date), "dd MMM", { locale: es }),
    ingresos: parseFloat(item.revenue || "0"),
    reservas: item.bookings,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Analiza el rendimiento de tus salas</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análisis</CardTitle>
          <CardDescription>Selecciona el rango de fechas para el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={handlePreviousMonth} className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Mes Anterior</span>
                <span className="sm:hidden">← Anterior</span>
              </Button>
              <Button variant="outline" onClick={handleNextMonth} className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Mes Siguiente</span>
                <span className="sm:hidden">Siguiente →</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Reservas completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sala Más Usada</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostUsedRoom?.roomName || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {mostUsedRoom?.totalBookings || 0} reservas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {occupancyData?.reduce((sum, item) => sum + (item.totalHours || 0), 0) || 0}h
            </div>
            <p className="text-xs text-muted-foreground">Tiempo de uso total</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ocupación por Sala</CardTitle>
            <CardDescription>Número de reservas por sala</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reservas" fill="#3b82f6" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estados de Reservas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos Diarios</CardTitle>
            <CardDescription>Evolución de ingresos en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos ($)" />
                <Line type="monotone" dataKey="reservas" stroke="#3b82f6" name="Reservas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos por Sala</CardTitle>
            <CardDescription>Comparación de ingresos generados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
