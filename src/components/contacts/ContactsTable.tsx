"use client";

import { useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Contact } from "@/lib/types/contact";
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
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { NotesDialog } from "./NotesDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditableNextAction } from "./EditableNextAction";

interface ContactsTableProps {
  onEditContact: (contact: Contact) => void;
  contacts: Contact[] | null;
  isLoading: boolean;
  nextActions: string[];
  selectedContactIds: string[];
  onSelectContact: (contactId: string) => void;
  onSelectAll: () => void;
}

export function ContactsTable({ 
  onEditContact, 
  contacts, 
  isLoading, 
  nextActions,
  selectedContactIds,
  onSelectContact,
  onSelectAll
}: ContactsTableProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [notesContact, setNotesContact] = useState<Contact | null>(null);
  
  const allSelected = contacts && contacts.length > 0 && contacts.every(c => selectedContactIds.includes(c.id));


  const handleStatusChange = async (contact: Contact, newStatus: string) => {
    if (!user) return;
    const docRef = doc(firestore, "users", user.uid, "contacts", contact.id);
    const dataToSave = { status: newStatus };
    updateDoc(docRef, dataToSave)
      .then(() => {
        toast({
          title: "Estado Actualizado",
          description: `El estado de "${contact.companyName}" es ahora "${newStatus}".`,
        });
      })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: dataToSave
        }));
      });
  };

  const handleDelete = async () => {
    if (!contactToDelete || !user) return;
    const docRef = doc(firestore, "users", user.uid, "contacts", contactToDelete.id);
    deleteDoc(docRef)
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete'
        }))
      });
    
    toast({
      title: "Contacto Eliminado",
      description: `"${contactToDelete.companyName}" ha sido eliminado.`,
    });
    setContactToDelete(null);
  };
  
  const handleNotesDialogClose = () => {
    setNotesContact(null);
  };
  
  const toDate = (timestamp: unknown): Date | null => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return null;
  }

  const getStatusBadge = (status: Contact["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="default">Nuevo</Badge>;
      case "contacted":
        return <Badge variant="secondary">Contactado</Badge>;
      case "follow-up":
        return <Badge className="bg-yellow-500 text-white">Seguimiento</Badge>;
      case "closed":
        return <Badge variant="destructive">Cerrado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return <div>Cargando contactos...</div>;
  }

  if (!contacts || contacts.length === 0) {
    return <p>No se encontraron contactos con los filtros seleccionados. ¡Intenta con otra combinación!</p>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Empresa / Contacto</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Cifra Ventas</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Última Factura</TableHead>
              <TableHead>Próxima Acción</TableHead>
              <TableHead>Lista</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedContactIds.includes(contact.id)}
                    onCheckedChange={() => onSelectContact(contact.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{contact.companyName}</div>
                  <div className="text-sm text-muted-foreground">{contact.contactPerson}</div>
                  {contact.website && (
                    <a 
                      href={contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline block mt-1"
                    >
                      {contact.website}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{contact.email}</div>
                  <div className="text-sm text-muted-foreground">{contact.phone}</div>
                </TableCell>
                <TableCell>
                  {contact.salesAmount && (
                    <div className="text-sm font-medium">{contact.salesAmount}</div>
                  )}
                </TableCell>
                <TableCell>
                  {contact.discount && (
                    <div className="text-sm">{contact.discount}</div>
                  )}
                </TableCell>
                <TableCell>
                  {contact.lastInvoiceDate && (
                    <div className="text-sm">{contact.lastInvoiceDate}</div>
                  )}
                </TableCell>
                <TableCell>
                  <EditableNextAction contact={contact} allNextActions={nextActions} />
                </TableCell>
                <TableCell>
                  {contact.listName && <Badge variant="outline">{contact.listName}</Badge>}
                </TableCell>
                <TableCell>
                   <Select
                      value={contact.status}
                      onValueChange={(newStatus) => handleStatusChange(contact, newStatus)}
                    >
                      <SelectTrigger className="w-[120px] focus:ring-0 focus:ring-offset-0 border-none shadow-none">
                         <div className="flex items-center">
                           {getStatusBadge(contact.status)}
                         </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nuevo</SelectItem>
                        <SelectItem value="contacted">Contactado</SelectItem>
                        <SelectItem value="follow-up">Seguimiento</SelectItem>
                        <SelectItem value="closed">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className="text-right space-x-1">
                   <Button variant="ghost" size="icon" onClick={() => setNotesContact(contact)}>
                      <FilePenLine className="h-4 w-4" />
                      <span className="sr-only">Añadir/Ver Notas</span>
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => onEditContact(contact)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                   </Button>
                   <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => setContactToDelete(contact)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                   </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={(open) => !open && setContactToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              contacto de &quot;{contactToDelete?.companyName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notesContact && (
        <NotesDialog
          isOpen={!!notesContact}
          onClose={handleNotesDialogClose}
          contact={notesContact}
        />
      )}
    </>
  );
}
