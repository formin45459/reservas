import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Booking {
  id: number;
  roomId: number;
  clientId: number;
  startTime: Date;
  endTime: Date;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  purpose?: string | null;
  attendees?: number | null;
  totalPrice?: string | null;
  notes?: string | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
}

interface Room {
  id: number;
  name: string;
  type: "meeting" | "conference" | "training" | "office" | "event";
  capacity: number;
  description?: string | null;
  isAvailable: boolean;
  pricePerHour?: string | null;
  amenities?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BookingCalendarProps {
  bookings: Booking[];
  rooms: Room[];
  onBookingClick?: (booking: Booking) => void;
  onDateClick?: (date: Date) => void;
}

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export function BookingCalendar({ bookings, rooms, onBookingClick, onDateClick }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const dateKey = format(new Date(booking.startTime), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(booking);
    });
    return map;
  }, [bookings]);

  const getRoomName = (roomId: number) => {
    return rooms.find((r) => r.id === roomId)?.name || "Sala desconocida";
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="flex items-center gap-4 text-sm">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", statusColors[status as keyof typeof statusColors])} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendario */}
      <Card className="p-4">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[120px] p-2 border rounded-lg transition-colors",
                  isCurrentMonth ? "bg-card" : "bg-muted/30",
                  isToday && "ring-2 ring-primary",
                  onDateClick && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isToday && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>

                {/* Reservas del día */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity text-white",
                        statusColors[booking.status]
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick?.(booking);
                      }}
                    >
                      <div className="font-medium truncate">{getRoomName(booking.roomId)}</div>
                      <div className="truncate opacity-90">
                        {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayBookings.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
