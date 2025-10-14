"use client";

import { useState, useMemo } from "react";
import { Upload, Download, FileText, ClipboardPaste, ListPlus, ChevronsUpDown, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, getDocs, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import Papa from "papaparse";
import type { Contact } from "@/lib/types/contact";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const csvTemplateContent = `companyName,contactPerson,phone,email,address,province,status,firstContactDate,nextAction,nextActionDate,notes,source
"Ekoargi Instalaciones Eléctricas S.L.","—","945121898","ekoargi@ekoargi.com","C/ Alibarra, 60, 01010 Vitoria-Gasteiz","Álava","new","2025-10-13T12:00:00.000Z","Primer contacto","2025-10-20T12:00:00.000Z","Empresa especializada en instalaciones eléctricas residenciales e industriales.","https://ekoargi.com/"
"Electrotécnica de Urbina S.A.","—","945290667","—","Arangutxi 21, Pol. Ind. Jundiz, 01015 Vitoria-Gasteiz","Álava","new","2025-10-13T12:00:00.000Z","Primer contacto","2025-10-20T12:00:00.000Z","Proyectos industriales y autoconsumo fotovoltaico.","https://eldurbina.es/"
"San Juan Grupo Servicios Empresariales S.L.","—","945300429","info@sanjuangrupo.com","C/ Zumeta, 1, Pab. 2, 01200 Agurain-Salvatierra / C/ Venta de la Estrella, 2, 01004 Vitoria-Gasteiz","Álava","new","2025-10-13T12:00:00.000Z","Primer contacto","2025-10-20T12:00:00.000Z","Servicios eléctricos y mantenimiento industrial.","https://www.sanjuangrupo.com/"`;

export function ImportExportCard() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [comboOpen, setComboOpen] = useState(false);


  const allContactsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "contacts");
  }, [firestore, user]);

  const { data: allContacts } = useCollection<Contact>(allContactsQuery);

  const contactLists = useMemo(() => {
    if (!allContacts) return [];
    const lists = allContacts.map(c => c.listName).filter(Boolean) as string[];
    return [...new Set(lists)];
  }, [allContacts]);

  const handleExport = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }
    setIsExporting(true);
    try {
      const contactsRef = collection(firestore, "users", user.uid, "contacts");
      const querySnapshot = await getDocs(contactsRef);
      const contacts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Contact[];

      if (contacts.length === 0) {
        toast({ title: "No hay contactos para exportar" });
        return;
      }
      
      const contactsToExport = contacts.map(c => ({
        companyName: c.companyName,
        contactPerson: c.contactPerson,
        phone: c.phone,
        email: c.email,
        address: c.address,
        province: c.province,
        status: c.status,
        firstContactDate: c.firstContactDate ? new Date((c.firstContactDate as any).seconds * 1000).toISOString() : '',
        nextAction: c.nextAction,
        nextActionDate: c.nextActionDate ? new Date((c.nextActionDate as any).seconds * 1000).toISOString() : '',
        notes: c.notes,
        listName: c.listName,
        source: c.source,
      }));

      const csv = Papa.unparse(contactsToExport);
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `contacts_export_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Exportación exitosa" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Exportación fallida", description: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  const processImportData = async (data: any[]) => {
    if (!user) {
      toast({ variant: "destructive", title: "No autenticado" });
      return;
    }
     if (!selectedList) {
      toast({
        variant: "destructive",
        title: "Lista no seleccionada",
        description: "Por favor, selecciona o crea una lista para los contactos importados.",
      });
      setIsImporting(false);
      return;
    }
    setIsImporting(true);
    try {
      const contactsRef = collection(firestore, "users", user.uid, "contacts");
      const querySnapshot = await getDocs(contactsRef);
      const existingContacts = querySnapshot.docs.map(doc => doc.data());

      const batch = writeBatch(firestore);
      let newContacts = 0;
      let duplicates = 0;

      for (const row of data as any) {
        if (!row.companyName && !row.email && !row.phone) {
          continue; // Skip empty rows
        }
        
        const isDuplicate = existingContacts.some(
          (c: any) =>
            (row.companyName && c.companyName === row.companyName) ||
            (row.email && c.email === row.email) ||
            (row.phone && c.phone === row.phone)
        );

        if (isDuplicate) {
          duplicates++;
          continue;
        }
        
        const newContactRef = doc(collection(firestore, "users", user.uid, "contacts"));
        
        const contactData: Omit<Contact, 'id' | 'createdAt'> = {
          companyName: row.companyName || "",
          contactPerson: row.contactPerson || "",
          phone: row.phone || "",
          email: row.email || "",
          address: row.address || "",
          province: row.province || "",
          status: row.status || "new",
          firstContactDate: row.firstContactDate ? new Date(row.firstContactDate) : new Date(),
          nextAction: row.nextAction || "",
          nextActionDate: row.nextActionDate ? new Date(row.nextActionDate) : null,
          notes: row.notes || "",
          listName: selectedList,
          source: row.source || "",
        };
        batch.set(newContactRef, {...contactData, createdAt: serverTimestamp()});
        newContacts++;
      }

      await batch.commit();

      toast({
        title: "Importación Completa",
        description: `${newContacts} contactos importados a la lista "${selectedList}". ${duplicates} duplicados omitidos.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Importación Fallida",
        description: "Por favor, revisa el formato del CSV e inténtalo de nuevo. " + error.message,
      });
    } finally {
      setIsImporting(false);
    }
  };


  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!selectedList) {
      toast({
        variant: "destructive",
        title: "Lista no seleccionada",
        description: "Por favor, selecciona o crea una lista para los contactos importados.",
      });
      return;
    }
    
    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await processImportData(results.data);
        // Reset file input
        event.target.value = "";
      },
      error: (error: any) => {
        toast({ variant: "destructive", title: "Error de análisis", description: error.message });
        setIsImporting(false);
      },
    });
  };

  const handleImportText = () => {
    if (!csvText.trim() || !user) return;

    if (!selectedList) {
      toast({
        variant: "destructive",
        title: "Lista no seleccionada",
        description: "Por favor, selecciona o crea una lista para los contactos importados.",
      });
      return;
    }

    setIsImporting(true);
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        await processImportData(results.data);
        setCsvText("");
      },
      error: (error: any) => {
        toast({ variant: "destructive", title: "Error de análisis", description: error.message });
        setIsImporting(false);
      },
    });
  };

  return (
    <Card className="w-full h-full border-0 shadow-none rounded-none flex flex-col">
      <CardHeader>
        <CardTitle>Importar y Exportar Contactos</CardTitle>
        <CardDescription>Gestiona tus contactos importando desde o exportando a un archivo CSV.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 p-4 md:p-6">
        
        {/* --- Export Section --- */}
        <div className="space-y-4 rounded-lg border p-4">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Download className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Exportar Todos los Contactos</h3>
                  <p className="text-sm text-muted-foreground">Descarga todos tus contactos en un único archivo CSV.</p>
                </div>
              </div>
              <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto flex-shrink-0">
                {isExporting ? "Exportando..." : "Exportar a CSV"}
              </Button>
            </div>
        </div>


        {/* --- Import Section --- */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Importar Contactos</h3>
                <p className="text-sm text-muted-foreground">Añade nuevos contactos desde un archivo CSV o pegando texto.</p>
              </div>
          </div>
          
          <div className="space-y-4 pl-12">
              {/* Step 1: List Selector */}
              <div className="space-y-2">
                  <h4 className="font-semibold">Paso 1: Elige una lista de destino</h4>
                  <p className="text-sm text-muted-foreground">Todos los contactos importados se añadirán a esta lista. Puedes crear una nueva si no existe.</p>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                      <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={comboOpen}
                              className="w-full max-w-sm justify-between"
                          >
                              {selectedList || "Seleccionar o crear lista..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                              <CommandInput placeholder="Buscar o crear lista..." />
                              <CommandList>
                                  <CommandEmpty>
                                      <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                          const inputValue = (document.querySelector('[cmdk-input]') as HTMLInputElement).value;
                                          setSelectedList(inputValue);
                                          setComboOpen(false);
                                        }}
                                      >
                                        <ListPlus className="mr-2 h-4 w-4" />
                                        Crear nueva lista &quot;{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value}&quot;
                                      </Button>
                                  </CommandEmpty>
                                  <CommandGroup>
                                      {contactLists.map((list) => (
                                      <CommandItem
                                          value={list}
                                          key={list}
                                          onSelect={(currentValue) => {
                                              setSelectedList(currentValue === selectedList ? "" : list);
                                              setComboOpen(false);
                                          }}
                                      >
                                          <Check
                                          className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedList === list ? "opacity-100" : "opacity-0"
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
              </div>

              {/* Step 2: Import Method */}
              <div className="space-y-2">
                  <h4 className="font-semibold">Paso 2: Añade tus contactos</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p>Puedes subir un archivo o pegar el texto. Asegúrate de que el formato sea correcto.</p>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto">Ver plantilla CSV</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl">
                            <DialogHeader>
                                <DialogTitle>Plantilla de Ejemplo CSV</DialogTitle>
                                <DialogDescription>
                                    Asegúrate de que tu archivo CSV tenga estas columnas. Los campos `companyName`, `email` o `phone` son recomendados.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-muted/50 p-4 border rounded-lg max-h-[60vh] overflow-y-auto">
                                <pre className="text-xs whitespace-pre-wrap"><code>{csvTemplateContent}</code></pre>
                            </div>
                             <Button variant="outline" size="sm" asChild className="mt-4 w-fit">
                                <a href="/contacts-example.csv" download>Descargar Ejemplo</a>
                            </Button>
                        </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                      {/* Import from File */}
                      <div className="space-y-2 rounded-lg border p-4 flex flex-col">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          <h3 className="font-medium">Desde un archivo CSV</h3>
                        </div>
                        <p className="text-sm text-muted-foreground flex-grow">Elige un archivo CSV de tu ordenador.</p>
                        <Button asChild disabled={isImporting || !selectedList}>
                            <label className="w-full cursor-pointer">
                              {isImporting ? "Importando..." : "Subir archivo"}
                              <input type="file" accept=".csv" className="sr-only" onChange={handleImportFile} disabled={isImporting || !selectedList} />
                            </label>
                        </Button>
                      </div>

                      {/* Paste CSV Text */}
                      <div className="space-y-2 rounded-lg border p-4 flex flex-col">
                         <div className="flex items-center gap-3">
                           <ClipboardPaste className="h-5 w-5" />
                           <h3 className="font-medium">Pegando el texto</h3>
                         </div>
                         <Textarea
                              placeholder="Pega aquí el contenido de tu CSV..."
                              value={csvText}
                              onChange={(e) => setCsvText(e.target.value)}
                              className="flex-grow"
                              rows={3}
                              disabled={isImporting || !selectedList}
                          />
                          <Button onClick={handleImportText} disabled={isImporting || !csvText.trim() || !selectedList}>
                              {isImporting ? "Importando..." : "Importar texto"}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}
