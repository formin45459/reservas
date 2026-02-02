import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

export default function Bookings() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: bookings, isLoading } = trpc.bookings.list.useQuery();
  const { data: rooms } = trpc.rooms.available.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Reserva creada exitosamente");
      setIsCreateOpen(false);
      utils.bookings.list.invalidate();
      utils.bookings.byDateRange.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear la reserva");
    },
  });

  const updateMutation = trpc.bookings.update.useMutation({
    onSuccess: () => {
      toast.success("Reserva actualizada exitosamente");
      utils.bookings.list.invalidate();
      utils.bookings.byDateRange.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la reserva");
    },
  });

  const cancelMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      toast.success("Reserva cancelada exitosamente");
      setIsCancelOpen(false);
      setCancelBookingId(null);
      setCancelReason("");
      utils.bookings.list.invalidate();
      utils.bookings.byDateRange.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al cancelar la reserva");
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startDate = formData.get("startDate") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${startDate}T${endTime}`);
    
    createMutation.mutate({
      roomId: parseInt(formData.get("roomId") as string),
      clientId: parseInt(formData.get("clientId") as string),
      startTime: startDateTime,
      endTime: endDateTime,
      purpose: formData.get("purpose") as string || undefined,
      attendees: parseInt(formData.get("attendees") as string) || undefined,
      totalPrice: formData.get("totalPrice") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleStatusChange = (bookingId: number, newStatus: string) => {
    updateMutation.mutate({
      id: bookingId,
      status: newStatus as any,
    });
  };

  const handleCancel = () => {
    if (cancelBookingId && cancelReason) {
      cancelMutation.mutate({
        id: cancelBookingId,
        reason: cancelReason,
      });
    }
  };

  const getRoomName = (roomId: number) => {
    return rooms?.find((r) => r.id === roomId)?.name || "Sala desconocida";
  };

  const getClientName = (clientId: number) => {
    return clients?.find((c) => c.id === clientId)?.name || "Cliente desconocido";
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Reservas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Administra todas las reservas de salas</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear Nueva Reserva</DialogTitle>
                <DialogDescription>Completa la información de la reserva</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="roomId">Sala *</Label>
                    <Select name="roomId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona sala" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms?.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} (Cap: {room.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="clientId">Cliente *</Label>
                    <Select name="clientId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Fecha *</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Hora de inicio *</Label>
                    <Input id="startTime" name="startTime" type="time" required />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Hora de fin *</Label>
                    <Input id="endTime" name="endTime" type="time" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="attendees">Asistentes</Label>
                    <Input id="attendees" name="attendees" type="number" min="1" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="totalPrice">Precio Total</Label>
                    <Input id="totalPrice" name="totalPrice" type="number" step="0.01" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="purpose">Propósito</Label>
                  <Input id="purpose" name="purpose" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Reserva"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
          <CardDescription>Todas las reservas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Sala</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Propósito</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>{getRoomName(booking.roomId)}</TableCell>
                  <TableCell>{getClientName(booking.clientId)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(booking.startTime), "dd MMM yyyy", { locale: es })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(booking.startTime), "HH:mm")} - {format(new Date(booking.endTime), "HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleStatusChange(booking.id, value)}
                      disabled={booking.status === "cancelled"}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <Badge className={cn("text-white", statusColors[booking.status])}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{booking.purpose || "-"}</TableCell>
                  <TableCell className="text-right">
                    {booking.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCancelBookingId(booking.id);
                          setIsCancelOpen(true);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Por favor proporciona un motivo para la cancelación
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancelReason">Motivo de cancelación *</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCancelOpen(false)}>
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelando..." : "Cancelar Reserva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
