import React, { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { STATIC_USERS } from "@/data/static";

export default function AdminUsers() {
  const [search, setSearch] = useState("");

  const users = STATIC_USERS.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Utilisateurs</h1>
        <p className="text-muted-foreground">{users.length} utilisateur(s) inscrit(s)</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou téléphone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Commandes</TableHead>
              <TableHead>Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{u.phone}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.address}</TableCell>
                <TableCell>
                  {u.orderCount > 0
                    ? <Badge variant="success">{u.orderCount} commande{u.orderCount > 1 ? "s" : ""}</Badge>
                    : <span className="text-muted-foreground text-xs">—</span>
                  }
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(u.createdAt), "d MMM yyyy", { locale: fr })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
