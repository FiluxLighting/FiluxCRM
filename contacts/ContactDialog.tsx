"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";
import type { Contact } from "@/lib/types/contact";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  contactLists: string[];
}

export function ContactDialog({ isOpen, onClose, contact, contactLists }: ContactDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar Contacto" : "Añadir Nuevo Contacto"}</DialogTitle>
          <DialogDescription>
            {contact
              ? "Actualiza los detalles de este contacto."
              : "Rellena la información para el nuevo contacto."}
          </DialogDescription>
        </DialogHeader>
        <ContactForm contact={contact} onSuccess={onClose} contactLists={contactLists} />
      </DialogContent>
    </Dialog>
  );
}
