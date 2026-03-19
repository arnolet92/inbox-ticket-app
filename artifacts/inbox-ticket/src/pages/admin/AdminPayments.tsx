import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { useListPayments } from "@workspace/api-client-react";

export default function AdminPayments() {
  const { data: payments, isLoading } = useListPayments();

  const getMethodBadge = (method: string) => {
    switch(method) {
      case "orange_money": return <span className="inline-flex items-center gap-1.5 font-medium text-[#ff6600]"><div className="w-2 h-2 rounded-full bg-[#ff6600]"></div> Orange Money</span>;
      case "mvola": return <span className="inline-flex items-center gap-1.5 font-medium text-[#00b050]"><div className="w-2 h-2 rounded-full bg-[#00b050]"></div> MVola</span>;
      case "mastercard": return <span className="inline-flex items-center gap-1.5 font-medium text-blue-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mastercard</span>;
      default: return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "success": return <Badge variant="success">Succès</Badge>;
      case "pending": return <Badge variant="warning">En attente</Badge>;
      case "failed": return <Badge variant="destructive">Échoué</Badge>;
      case "refunded": return <Badge variant="outline">Remboursé</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">Transactions</h1>
        <p className="text-muted-foreground">Historique des paiements reçus via les différents opérateurs.</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Réf. Transaction</TableHead>
              <TableHead>Commande Liée</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Détails Compte/Carte</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Chargement...</TableCell></TableRow>
            ) : payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">
                  {payment.transactionRef || `TXN-SYS-${payment.id}`}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <a href={`/admin/orders`} className="hover:text-accent underline underline-offset-2">#{payment.orderId.toString().padStart(6, '0')}</a>
                </TableCell>
                <TableCell>
                  {getMethodBadge(payment.method)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {payment.phoneNumber || (payment.cardLast4 ? `**** **** **** ${payment.cardLast4}` : 'N/A')}
                </TableCell>
                <TableCell className="font-bold text-white">
                  {formatMGA(payment.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>
                  {getStatusBadge(payment.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
