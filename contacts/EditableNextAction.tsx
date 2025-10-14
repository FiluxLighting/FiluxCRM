"use client";

import { useState } from "react";
import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@/lib/types/contact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit2, Save, X, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";

interface EditableNextActionProps {
  contact: Contact;
  allNextActions: string[];
}

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

export function EditableNextAction({ contact, allNextActions }: EditableNextActionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nextAction, setNextAction] = useState(contact.nextAction || "");
  const [nextActionDate, setNextActionDate] = useState<Date | null>(toDate(contact.nextActionDate));
  const [comboOpen, setComboOpen] = useState(false);


  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = () => {
    if (!user) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }
    const contactRef = doc(firestore, "users", user.uid, "contacts", contact.id);
    const dataToSave = {
        nextAction: nextAction || "",
        nextActionDate: nextActionDate ? Timestamp.fromDate(nextActionDate) : null,
    };
    updateDoc(contactRef, dataToSave)
      .then(() => {
        toast({ title: "Acción actualizada" });
        setIsEditing(false);
      })
      .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: contactRef.path,
            operation: 'update',
            requestResourceData: dataToSave
          }));
        toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la acción." });
      });
  };
  
  const handleCancel = () => {
    setNextAction(contact.nextAction || "");
    setNextActionDate(toDate(contact.nextActionDate));
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
         <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                    "w-full justify-between font-normal",
                    !nextAction && "text-muted-foreground"
                    )}
                >
                    {nextAction || "Seleccionar acción..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Buscar o crear acción..." />
                    <CommandList>
                      <CommandEmpty>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            const inputValue = (document.querySelector('[cmdk-input]') as HTMLInputElement).value;
                            setNextAction(inputValue);
                            setComboOpen(false);
                          }}
                        >
                          Crear nueva acción &quot;{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value}&quot;
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {allNextActions.map((action) => (
                        <CommandItem
                            value={action}
                            key={action}
                            onSelect={() => {
                                setNextAction(action)
                                setComboOpen(false)
                            }}
                        >
                            <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                action === nextAction ? "opacity-100" : "opacity-0"
                            )}
                            />
                            {action}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
            </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !nextActionDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nextActionDate ? format(nextActionDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={nextActionDate || undefined}
              onSelect={(date) => setNextActionDate(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave}>
                <Save className="h-4 w-4" />
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      {contact.nextAction || contact.nextActionDate ? (
        <div className="flex-1">
          <div>{contact.nextAction}</div>
          {contact.nextActionDate && (
            <div className="text-sm text-muted-foreground">
              {format(toDate(contact.nextActionDate)!, "P", { locale: es })}
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm flex-1">N/A</span>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        className="opacity-0 group-hover:opacity-100"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="h-4 w-4" />
        <span className="sr-only">Editar Próxima Acción</span>
      </Button>
    </div>
  );
}
