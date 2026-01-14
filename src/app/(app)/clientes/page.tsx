"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeleMatelCustomer {
  customer_id: number;
  company_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  province?: string;
  vat_number?: string;
  discount?: number;
  sales_amount_last_year?: number;
  last_invoice_date?: string;
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<TeleMatelCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/telematel/customers');
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
        toast({
          title: "Clientes cargados",
          description: `${data.count} clientes obtenidos de Telematel`,
        });
      } else {
        throw new Error(data.error || 'Error al cargar clientes');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudieron cargar los clientes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Datos sincronizados desde Telematel
          </p>
        </div>
        <Button onClick={fetchCustomers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {isLoading && customers.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando clientes desde Telematel...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Cifra Ventas</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead>Última Factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>
                    <div className="font-medium">{customer.company_name}</div>
                    {customer.vat_number && (
                      <div className="text-xs text-muted-foreground">
                        CIF: {customer.vat_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{customer.contact_person || '—'}</TableCell>
                  <TableCell>{customer.phone || '—'}</TableCell>
                  <TableCell>
                    {customer.address ? (
                      <div className="text-sm">
                        <div>{customer.address}</div>
                        {(customer.postal_code || customer.city) && (
                          <div className="text-muted-foreground">
                            {customer.postal_code} {customer.city}
                          </div>
                        )}
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell>{customer.email || '—'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(customer.sales_amount_last_year)}
                  </TableCell>
                  <TableCell className="text-right">
                    {customer.discount ? `${customer.discount}%` : '—'}
                  </TableCell>
                  <TableCell>{formatDate(customer.last_invoice_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {customers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Total: {customers.length} clientes
        </div>
      )}
    </div>
  );
}
