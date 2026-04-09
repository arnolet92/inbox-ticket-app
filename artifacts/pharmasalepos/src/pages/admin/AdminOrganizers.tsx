import React, { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AdminLayout } from "@/components/layout";
import { Card, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui";
import { STATIC_ORGANIZERS } from "@/data/static";

export default function AdminOrganizers() {
  const [search, setSearch] = useState("");

  const organizers = STATIC_ORGANIZERS.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Organisateurs</h1>
        <p className="text-muted-foreground">{organizers.length} organisateur(s)</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom ou société..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizers.map(o => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                      {o.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{o.name}</span>
                  </div>
                </TableCell>
                <TableCell>{o.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{o.email}</TableCell>
                <TableCell className="font-mono text-sm">{o.phone}</TableCell>
                <TableCell>
                  <Badge variant={o.status === "active" ? "success" : o.status === "suspended" ? "destructive" : "warning"}>
                    {o.status === "active" ? "Actif" : o.status === "suspended" ? "Suspendu" : "En attente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(o.createdAt), "d MMM yyyy", { locale: fr })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
