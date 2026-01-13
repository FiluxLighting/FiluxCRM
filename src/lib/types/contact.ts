import { z } from "zod";

export const contactSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
  contactPerson: z.string().min(1, "La persona de contacto es obligatoria"),
  phone: z.string().min(1, "El número de teléfono es obligatorio"),
  email: z.string().email("Dirección de correo electrónico inválida"),
  address: z.string().min(1, "La dirección es obligatoria"),
  province: z.string().optional(),
  status: z.enum(["new", "contacted", "follow-up", "closed"]),
  firstContactDate: z.date(),
  nextAction: z.string().optional(),
  nextActionDate: z.date().optional().nullable(),
  notes: z.string().optional(),
  listName: z.string().optional(),
  source: z.string().optional(),
  website: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export type Contact = Omit<ContactFormData, 'firstContactDate' | 'nextActionDate'> & {
  id: string;
  firstContactDate: any; // Firestore timestamp
  nextActionDate?: any; // Firestore timestamp
  createdAt?: any;
  notes?: string;
  source?: string;
  province?: string;
  website?: string;
};
