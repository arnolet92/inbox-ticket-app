import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { formatMGA, formatPaymentMethod } from "@/lib/utils";
import { STATIC_ORDERS } from "@/data/static";
import { getBilletCodes } from "@/lib/billetCodes";

const METHOD_BADGE: Record<string, React.ReactNode> = {
  orange_money: <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">🟠 Orange Money</span>,
  mvola:        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">🔴 MVola</span>,
  mastercard:   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">💳 Mastercard</span>,
  especes:      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">💵 Espèces</span>,
};

const payments = STATIC_ORDERS.map((o, i) => {
  const codes = getBilletCodes(o.id);
  return {
    id: 1000 + i,
    orderId: o.id,
    method: o.paymentMethod,
    phone: o.customerPhone,
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
              <TableHead>Numéro</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">{payment.transactionRef}</TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">
                  #{payment.orderId.toString().padStart(6, "0")}
                </TableCell>
                <TableCell>
                  {METHOD_BADGE[payment.method] ?? <span className="text-xs text-muted-foreground">{formatPaymentMethod(payment.method)}</span>}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {payment.phone || "N/A"}
                </TableCell>
                <TableCell className="font-bold text-white">{formatMGA(payment.amount)}</TableCell>
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
