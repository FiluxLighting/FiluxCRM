"use client";

import { useState, useMemo } from "react";
import { Plus, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { BulkActions } from "@/components/contacts/BulkActions";
import type { Contact } from "@/lib/types/contact";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const statusOptions: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  "follow-up": "Seguimiento",
  closed: "Cerrado",
};


export default function ContactsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  
  const [activeList, setActiveList] = useState<string>("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [activeNextAction, setActiveNextAction] = useState<string>("all");
  const [activeProvince, setActiveProvince] = useState<string>("all");

  const { user } = useUser();
  const firestore = useFirestore();

  const allContactsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "contacts");
  }, [firestore, user]);

  const { data: allContacts } = useCollection<Contact>(allContactsQuery);

  const { contactLists, nextActions, provinces } = useMemo(() => {
    if (!allContacts) return { contactLists: [], nextActions: [], provinces: [] };
    const lists = allContacts.map(c => c.listName).filter(Boolean) as string[];
    const actions = allContacts.map(c => c.nextAction).filter(Boolean) as string[];
    const provs = allContacts.map(c => c.province).filter(Boolean) as string[];
    return {
      contactLists: [...new Set(lists)],
      nextActions: [...new Set(actions)],
      provinces: [...new Set(provs)],
    };
  }, [allContacts]);

  const filteredContacts = useMemo(() => {
    if (!allContacts) return [];
    return allContacts.filter(contact => {
      const listMatch = activeList === 'all' || contact.listName === activeList;
      const statusMatch = activeStatus === 'all' || contact.status === activeStatus;
      const nextActionMatch = activeNextAction === 'all' || contact.nextAction === activeNextAction;
      const provinceMatch = activeProvince === 'all' || contact.province === activeProvince;
      return listMatch && statusMatch && nextActionMatch && provinceMatch;
    });
  }, [allContacts, activeList, activeStatus, activeNextAction, activeProvince]);
  
  const activeFilterCount = [activeList, activeStatus, activeNextAction, activeProvince].filter(f => f !== 'all').length;


  const handleAddContact = () => {
    setSelectedContact(null);
    setDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedContact(null);
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (!filteredContacts) return;
    
    const allIds = filteredContacts.map(c => c.id);
    const allSelected = allIds.every(id => selectedContactIds.includes(id));
    
    if (allSelected) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(allIds);
    }
  };

  const selectedContacts = useMemo(() => {
    if (!allContacts) return [];
    return allContacts.filter(c => selectedContactIds.includes(c.id));
  }, [allContacts, selectedContactIds]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">Contactos</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4" />
                    <span>Filtros</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="rounded-full px-2">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
                {/* List Filter */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <span>{activeList === 'all' ? 'Filtrar por lista' : `Lista: ${activeList}`}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={activeList} onValueChange={setActiveList}>
                                <DropdownMenuRadioItem value="all">Todas las listas</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                {contactLists.map((list) => (
                                    <DropdownMenuRadioItem key={list} value={list}>{list}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Status Filter */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                       <span>{activeStatus === 'all' ? 'Filtrar por estado' : `Estado: ${statusOptions[activeStatus]}`}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuRadioGroup value={activeStatus} onValueChange={setActiveStatus}>
                                <DropdownMenuRadioItem value="all">Todos los estados</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                {Object.entries(statusOptions).map(([key, value]) => (
                                    <DropdownMenuRadioItem key={key} value={key}>{value}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Province Filter */}
                <DropdownMenuSub>
                     <DropdownMenuSubTrigger disabled={provinces.length === 0}>
                        <span>{activeProvince === 'all' ? 'Filtrar por provincia' : `Provincia: ${activeProvince}`}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuRadioGroup value={activeProvince} onValueChange={setActiveProvince}>
                                <DropdownMenuRadioItem value="all">Todas las provincias</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                {provinces.map((province) => (
                                    <DropdownMenuRadioItem key={province} value={province}>{province}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                
                {/* Next Action Filter */}
                 <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={nextActions.length === 0}>
                        <span>{activeNextAction === 'all' ? 'Filtrar por acción' : `Acción: ${activeNextAction}`}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                             <DropdownMenuRadioGroup value={activeNextAction} onValueChange={setActiveNextAction}>
                                <DropdownMenuRadioItem value="all">Todas las acciones</DropdownMenuRadioItem>
                                <DropdownMenuSeparator />
                                {nextActions.map((action) => (
                                    <DropdownMenuRadioItem key={action} value={action}>{action}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        <Button onClick={handleAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Contacto
        </Button>
      </div>

      <BulkActions 
        selectedContacts={selectedContacts}
        onDeselectAll={() => setSelectedContactIds([])}
        contactLists={contactLists}
      />

      <ContactsTable 
        onEditContact={handleEditContact} 
        contacts={filteredContacts} 
        isLoading={!allContacts} 
        nextActions={nextActions}
        selectedContactIds={selectedContactIds}
        onSelectContact={handleSelectContact}
        onSelectAll={handleSelectAll}
      />

      {dialogOpen && (
        <ContactDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          contact={selectedContact}
          contactLists={contactLists}
        />
      )}
    </div>
  );
}
