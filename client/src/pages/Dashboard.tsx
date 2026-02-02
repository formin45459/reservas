import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Building, TrendingUp, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { startOfMonth, endOfMonth } from "date-fns";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [currentDate] = useState(new Date());

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: bookings, isLoading: loadingBookings } = trpc.bookings.byDateRange.useQuery({
    startDate,
    endDate,
  });

  const { data: rooms, isLoading: loadingRooms } = trpc.rooms.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (selectedRoomId === "all") return bookings;
    return bookings.filter((b) => b.roomId === parseInt(selectedRoomId));
  }, [bookings, selectedRoomId]);

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, pending: 0, confirmed: 0, completed: 0 };
    
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    };
  }, [bookings]);

  const handleBookingClick = (booking: any) => {
    setLocation(`/bookings/${booking.id}`);
  };

  const handleDateClick = (date: Date) => {
    setLocation(`/bookings/new?date=${date.toISOString()}`);
  };

  if (loadingBookings || loadingRooms) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gestiona tus reservas de salas</p>
        </div>
        <Button onClick={() => setLocation("/bookings/new")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Por confirmar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Reservas</CardTitle>
          <CardDescription>Visualiza y gestiona las reservas por sala</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Filtrar por sala</label>
            <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Selecciona una sala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las salas</SelectItem>
                {rooms?.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BookingCalendar
            bookings={filteredBookings}
            rooms={rooms || []}
            onBookingClick={handleBookingClick}
            onDateClick={handleDateClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}
