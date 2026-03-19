import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListOrders } from "@workspace/api-client-react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed": return <Badge variant="success">Confirmé</Badge>;
      case "pending": return <Badge variant="warning">En attente</Badge>;
      case "cancelled": return <Badge variant="destructive">Annulé</Badge>;
      case "refunded": return <Badge variant="outline">Remboursé</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Commandes</h1>
        <p className="text-muted-foreground">Suivez les réservations et les achats de billets.</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Billet(s)</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  #{order.id.toString().padStart(6, '0')}
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                  {order.customerPhone && <div className="text-xs text-muted-foreground">{order.customerPhone}</div>}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {order.event?.title}
                </TableCell>
                <TableCell>
                  {order.quantity}x <span className="text-muted-foreground text-xs">{order.ticketType?.name}</span>
                </TableCell>
                <TableCell className="font-bold text-accent">
                  {formatMGA(order.totalAmount)}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(order.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
