"use client";

import { useState } from "react";
import { Trash2, Tag, ListX, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, deleteDoc } from "firebase/firestore";
import type { Contact } from "@/lib/types/contact";
import { Badge } from "@/components/ui/badge";

interface BulkActionsProps {
  selectedContacts: Contact[];
  onDeselectAll: () => void;
  contactLists: string[];
}

const statusOptions: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  "follow-up": "Seguimiento",
  closed: "Cerrado",
};

export function BulkActions({ selectedContacts, onDeselectAll, contactLists }: BulkActionsProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedList, setSelectedList] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkDelete = async () => {
    if (!user || selectedContacts.length === 0) return;
    
    setIsProcessing(true);
    try {
      const batch = writeBatch(firestore);
      
      selectedContacts.forEach((contact) => {
        const docRef = doc(firestore, "users", user.uid, "contacts", contact.id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      
      toast({
        title: "Contactos eliminados",
        description: `${selectedContacts.length} contactos han sido eliminados.`,
      });
      
      onDeselectAll();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async () => {
    if (!user || selectedContacts.length === 0 || !selectedStatus) return;
    
    setIsProcessing(true);
    try {
      const batch = writeBatch(firestore);
      
      selectedContacts.forEach((contact) => {
        const docRef = doc(firestore, "users", user.uid, "contacts", contact.id);
        batch.update(docRef, { status: selectedStatus });
      });
      
      await batch.commit();
      
      toast({
        title: "Estado actualizado",
        description: `${selectedContacts.length} contactos actualizados a "${statusOptions[selectedStatus]}".`,
      });
      
      onDeselectAll();
      setShowStatusDialog(false);
      setSelectedStatus("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkListChange = async () => {
    if (!user || selectedContacts.length === 0 || !selectedList) return;
    
    setIsProcessing(true);
    try {
      const batch = writeBatch(firestore);
      
      selectedContacts.forEach((contact) => {
        const docRef = doc(firestore, "users", user.uid, "contacts", contact.id);
        batch.update(docRef, { listName: selectedList });
      });
      
      await batch.commit();
      
      toast({
        title: "Lista actualizada",
        description: `${selectedContacts.length} contactos movidos a "${selectedList}".`,
      });
      
      onDeselectAll();
      setShowListDialog(false);
      setSelectedList("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al mover",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedContacts.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-muted/50 border rounded-lg">
        <Badge variant="secondary" className="text-sm">
          {selectedContacts.length} seleccionados
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Acciones masivas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Cambiar estado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowListDialog(true)}>
              <Tag className="mr-2 h-4 w-4" />
              Mover a lista
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar seleccionados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDeselectAll}
          className="ml-auto"
        >
          Deseleccionar todos
        </Button>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedContacts.length} contactos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los contactos seleccionados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar estado de {selectedContacts.length} contactos</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona el nuevo estado para los contactos seleccionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusOptions).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkStatusChange}
              disabled={isProcessing || !selectedStatus}
            >
              {isProcessing ? "Actualizando..." : "Actualizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* List Change Dialog */}
      <AlertDialog open={showListDialog} onOpenChange={setShowListDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover {selectedContacts.length} contactos a otra lista</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona la lista de destino para los contactos seleccionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una lista" />
              </SelectTrigger>
              <SelectContent>
                {contactLists.map((list) => (
                  <SelectItem key={list} value={list}>
                    {list}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkListChange}
              disabled={isProcessing || !selectedList}
            >
              {isProcessing ? "Moviendo..." : "Mover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
