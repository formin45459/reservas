import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Building, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const roomTypeLabels = {
  meeting: "Reunión",
  conference: "Conferencia",
  training: "Capacitación",
  office: "Oficina",
  event: "Evento",
};

export default function Rooms() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const { data: rooms, isLoading, refetch } = trpc.rooms.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.rooms.create.useMutation({
    onSuccess: () => {
      toast.success("Sala creada exitosamente");
      setIsCreateOpen(false);
      utils.rooms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear la sala");
    },
  });

  const updateMutation = trpc.rooms.update.useMutation({
    onSuccess: () => {
      toast.success("Sala actualizada exitosamente");
      setIsEditOpen(false);
      setEditingRoom(null);
      utils.rooms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la sala");
    },
  });

  const deleteMutation = trpc.rooms.delete.useMutation({
    onSuccess: () => {
      toast.success("Sala eliminada exitosamente");
      setDeleteRoomId(null);
      utils.rooms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar la sala");
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      capacity: parseInt(formData.get("capacity") as string),
      description: formData.get("description") as string || undefined,
      pricePerHour: formData.get("pricePerHour") as string || undefined,
      isAvailable: formData.get("isAvailable") === "on",
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: editingRoom.id,
      name: formData.get("name") as string,
      type: formData.get("type") as any,
      capacity: parseInt(formData.get("capacity") as string),
      description: formData.get("description") as string || undefined,
      pricePerHour: formData.get("pricePerHour") as string || undefined,
      isAvailable: formData.get("isAvailable") === "on",
    });
  };

  const handleDelete = () => {
    if (deleteRoomId) {
      deleteMutation.mutate({ id: deleteRoomId });
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Salas</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Administra las salas disponibles para reserva</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Crear Nueva Sala</DialogTitle>
                <DialogDescription>Completa la información de la sala</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" name="name" required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roomTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacidad *</Label>
                    <Input id="capacity" name="capacity" type="number" min="1" required />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="pricePerHour">Precio por hora</Label>
                  <Input id="pricePerHour" name="pricePerHour" type="number" step="0.01" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="isAvailable" name="isAvailable" defaultChecked />
                  <Label htmlFor="isAvailable">Disponible</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creando..." : "Crear Sala"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms?.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    {room.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="secondary">{roomTypeLabels[room.type]}</Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingRoom(room);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteRoomId(room.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capacidad: {room.capacity} personas</span>
                </div>
                {room.pricePerHour && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${room.pricePerHour}/hora</span>
                  </div>
                )}
                {room.description && (
                  <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                )}
                <div className="pt-2">
                  <Badge variant={room.isAvailable ? "default" : "secondary"}>
                    {room.isAvailable ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingRoom && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>Editar Sala</DialogTitle>
                <DialogDescription>Modifica la información de la sala</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input id="edit-name" name="name" defaultValue={editingRoom.name} required />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Tipo *</Label>
                    <Select name="type" defaultValue={editingRoom.type} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roomTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-capacity">Capacidad *</Label>
                    <Input id="edit-capacity" name="capacity" type="number" min="1" defaultValue={editingRoom.capacity} required />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-pricePerHour">Precio por hora</Label>
                  <Input id="edit-pricePerHour" name="pricePerHour" type="number" step="0.01" defaultValue={editingRoom.pricePerHour || ""} />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea id="edit-description" name="description" rows={3} defaultValue={editingRoom.description || ""} />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="edit-isAvailable" name="isAvailable" defaultChecked={editingRoom.isAvailable} />
                  <Label htmlFor="edit-isAvailable">Disponible</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteRoomId !== null} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
