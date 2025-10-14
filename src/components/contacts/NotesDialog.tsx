
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@/lib/types/contact";
import { errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function NotesDialog({ isOpen, onClose, contact }: NotesDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [notes, setNotes] = useState(contact?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(contact?.notes || "");
  }, [contact]);

  const handleSave = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }
    setIsSaving(true);
    
    const contactRef = doc(firestore, "users", user.uid, "contacts", contact.id);
    const dataToSave = { notes };

    updateDoc(contactRef, dataToSave)
      .then(() => {
        toast({ title: "Éxito", description: "Notas guardadas correctamente." });
        onClose();
      })
      .catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: contactRef.path,
          operation: 'update',
          requestResourceData: dataToSave
        }));
        toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar las notas." });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notas para {contact.companyName}</DialogTitle>
          <DialogDescription>
            Añade o edita las notas para este contacto.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe tus notas aquí..."
            rows={8}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Notas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
