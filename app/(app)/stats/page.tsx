"use client";

import { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Contact } from "@/lib/types/contact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusOptions: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  "follow-up": "Seguimiento",
  closed: "Cerrado",
};

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function StatsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const allContactsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, "users", user.uid, "contacts");
  }, [firestore, user]);

  const { data: allContacts, isLoading } = useCollection<Contact>(allContactsQuery);

  const stats = useMemo(() => {
    if (!allContacts) {
      return {
        totalContacts: 0,
        byStatus: [],
        byProvince: [],
        byList: [],
        upcomingActions: [],
        statusCounts: {},
        totalLists: 0
      };
    }

    const byStatus = Object.entries(
      allContacts.reduce((acc, contact) => {
        const status = contact.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: statusOptions[name] || name, contacts: value }));


    const byProvince = Object.entries(
      allContacts.reduce((acc, contact) => {
        const province = contact.province || 'Sin especificar';
        acc[province] = (acc[province] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, contacts: value }));

    const byList = Object.entries(
      allContacts.reduce((acc, contact) => {
        const listName = contact.listName || 'Sin lista';
        acc[listName] = (acc[listName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, contacts: value }));

    const upcomingActions = allContacts
        .filter(c => c.nextActionDate && (c.nextActionDate as any).toDate() > new Date())
        .sort((a,b) => (a.nextActionDate as any).toDate() - (b.nextActionDate as any).toDate())
        .slice(0,5);

    const statusCounts = allContacts.reduce((acc, contact) => {
        const status = contact.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalLists = new Set(allContacts.map(c => c.listName).filter(Boolean)).size;

    return {
      totalContacts: allContacts.length,
      byStatus,
      byProvince,
      byList,
      upcomingActions,
      statusCounts,
      totalLists
    };
  }, [allContacts]);

  if (isLoading) {
    return <div className="p-4 md:p-6 lg:p-8">Cargando estadísticas...</div>;
  }

  if (!allContacts) {
    return <div className="p-4 md:p-6 lg:p-8">No hay contactos para mostrar estadísticas.</div>
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contactos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos Nuevos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statusCounts['new'] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statusCounts['follow-up'] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLists}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Estado</CardTitle>
            <CardDescription>Distribución de contactos según su estado actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={stats.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="contacts"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {stats.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Upcoming Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Acciones</CardTitle>
            <CardDescription>Las 5 próximas acciones programadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingActions.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.upcomingActions.map(contact => (
                            <TableRow key={contact.id}>
                                <TableCell>{(contact as Contact).companyName}</TableCell>
                                <TableCell>{(contact as Contact).nextAction}</TableCell>
                                <TableCell>
                                    {format((contact as Contact).nextActionDate.toDate(), "P", { locale: es })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-sm text-muted-foreground">No hay acciones programadas.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
         {/* Province Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Provincia</CardTitle>
             <CardDescription>Recuento de contactos en cada provincia.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byProvince} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="contacts" fill="#8884d8" name="Contactos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* List Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Lista</CardTitle>
             <CardDescription>Recuento de contactos en cada lista.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byList} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false}/>
                <Tooltip />
                <Legend />
                <Bar dataKey="contacts" fill="#82ca9d" name="Contactos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}