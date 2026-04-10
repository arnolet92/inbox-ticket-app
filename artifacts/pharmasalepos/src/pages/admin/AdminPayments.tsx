import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { STATIC_ORDERS } from "@/data/static";
import { getBilletCodes } from "@/lib/billetCodes";
import { PaymentBadge } from "@/components/PaymentBadge";

const payments = STATIC_ORDERS.map((o, i) => {
  const codes = getBilletCodes(o.id);
  return {
    id: 1000 + i,
    orderId: o.id,
    method: o.paymentMethod,
    phoneNumber: o.customerPhone,
    cardLast4: null as string | null,
    amount: o.totalAmount,
    status: o.status === "confirmed" ? "success" : o.status === "pending" ? "pending" : "failed",
    createdAt: o.createdAt,
    transactionRef: `TXN-${codes.confirmCode}`,
  };
});

function getStatusBadge(status: string) {
  switch (status) {
    case "success":  return <Badge variant="success">Succès</Badge>;
    case "pending":  return <Badge variant="warning">En attente</Badge>;
    case "failed":   return <Badge variant="destructive">Échoué</Badge>;
    case "refunded": return <Badge variant="outline">Remboursé</Badge>;
    default:         return <Badge>{status}</Badge>;
  }
}

export default function AdminPayments() {
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
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">
                  {payment.transactionRef}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <span className="font-mono">#{payment.orderId.toString().padStart(6, "0")}</span>
                </TableCell>
                <TableCell>
                  <PaymentBadge method={payment.method} size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {payment.phoneNumber || (payment.cardLast4 ? `**** **** **** ${payment.cardLast4}` : "N/A")}
                </TableCell>
                <TableCell className="font-bold text-white">
                  {formatMGA(payment.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
