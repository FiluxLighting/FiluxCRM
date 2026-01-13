"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contact } from "@/lib/types/contact";
import { contactSchema } from "@/lib/types/contact";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors";
import { useState } from "react";

interface ContactFormProps {
  contact?: Contact | null;
  onSuccess: () => void;
  contactLists: string[];
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

export function ContactForm({ contact, onSuccess, contactLists }: ContactFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [comboOpen, setComboOpen] = useState(false)

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      companyName: contact?.companyName || "",
      contactPerson: contact?.contactPerson || "",
      phone: contact?.phone || "",
      email: contact?.email || "",
      address: contact?.address || "",
      province: contact?.province || "",
      status: contact?.status || "new",
      firstContactDate: toDate(contact?.firstContactDate) || new Date(),
      nextAction: contact?.nextAction || "",
      nextActionDate: toDate(contact?.nextActionDate) || undefined,
      notes: contact?.notes || "",
      listName: contact?.listName || "",
      source: contact?.source || "",
      website: contact?.website || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para gestionar contactos.",
      });
      return;
    }

    try {
      const dataToSave: any = {
        ...values,
        firstContactDate: values.firstContactDate,
        nextActionDate: values.nextActionDate || null,
        notes: values.notes || "",
        listName: values.listName || "",
        source: values.source || "",
        province: values.province || "",
      };

      if (contact) {
        // Update existing contact
        const contactRef = doc(firestore, "users", user.uid, "contacts", contact.id);
        updateDoc(contactRef, dataToSave)
          .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: contactRef.path,
              operation: 'update',
              requestResourceData: dataToSave
            }))
          });

        toast({ title: "Éxito", description: "Contacto actualizado correctamente." });
      } else {
        // Add new contact
        const collectionRef = collection(firestore, "users", user.uid, "contacts");
        addDoc(collectionRef, { ...dataToSave, createdAt: serverTimestamp() })
          .catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: collectionRef.path,
              operation: 'create',
              requestResourceData: dataToSave
            }))
          });
        toast({ title: "Éxito", description: "Contacto añadido correctamente." });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar el contacto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona de Contacto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://ejemplo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="contacted">Contactado</SelectItem>
                    <SelectItem value="follow-up">Seguimiento</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
              control={form.control}
              name="firstContactDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Primer Contacto</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(toDate(field.value)!, "PPP")
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate(field.value) ?? undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="listName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Lista de Contactos</FormLabel>
                    <Popover open={comboOpen} onOpenChange={setComboOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value || "Seleccionar lista"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Buscar o crear lista..." />
                                <CommandList>
                                  <CommandEmpty>
                                    <Button
                                      className="w-full"
                                      variant="outline"
                                      onClick={() => {
                                        const inputValue = (document.querySelector('[cmdk-input]') as HTMLInputElement).value;
                                        form.setValue("listName", inputValue, { shouldValidate: true });
                                        setComboOpen(false);
                                      }}
                                    >
                                      Crear nueva lista &quot;{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value}&quot;
                                    </Button>
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {contactLists.map((list) => (
                                    <CommandItem
                                        value={list}
                                        key={list}
                                        onSelect={() => {
                                          form.setValue("listName", list)
                                          setComboOpen(false)
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            list === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {list}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
            />
          <FormField
            control={form.control}
            name="nextAction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próxima Acción</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
              control={form.control}
              name="nextActionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Próxima Acción</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(toDate(field.value)!, "PPP")
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate(field.value) ?? undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="p. ej. https://ejemplo.com"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
            <FormItem className="md:col-span-2">
                <FormLabel>Notas</FormLabel>
                <FormControl>
                <Textarea
                    placeholder="Añade notas sobre este contacto..."
                    className="resize-none"
                    {...field}
                />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        </div>
        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
                ? "Guardando..."
                : contact
                ? "Guardar Cambios"
                : "Añadir Contacto"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
