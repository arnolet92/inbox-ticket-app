import React, { useState } from "react";
import { useSearch } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Input, Select, Button } from "@/components/ui";
import { EventCard } from "@/components/EventCard";
import { useListEvents, type ListEventsStatus } from "@workspace/api-client-react";
import { Search } from "lucide-react";

export default function Events() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<ListEventsStatus | "">("upcoming");

  const { data: events, isLoading } = useListEvents({
    category: category || undefined,
    search: search || undefined,
    status: (status as ListEventsStatus) || undefined
  });

  return (
    <PublicLayout>
      <div className="bg-card border-b border-border pt-12 pb-24 african-pattern-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">Tous les événements</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez l'événement qui vous correspond parmi notre sélection exclusive.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 mb-24">
        <div className="glass-panel p-6 rounded-2xl mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="Rechercher un événement, une ville..." 
              className="pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="md:w-64"
          >
            <option value="">Toutes catégories</option>
            <option value="Concert">🎵 Concert</option>
            <option value="Festival">🎪 Festival</option>
            <option value="Sport">⚽ Sport</option>
            <option value="Conférence">🎯 Conférence</option>
            <option value="Soirée">🌙 Soirée</option>
          </Select>
          <Select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as any)}
            className="md:w-48"
          >
            <option value="">Tous les statuts</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="past">Passé</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border border-dashed">
            <div className="text-6xl mb-4">🏜️</div>
            <h3 className="text-2xl font-bold font-display mb-2">Aucun événement trouvé</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
            <Button variant="outline" className="mt-6" onClick={() => { setCategory(""); setSearch(""); setStatus("upcoming"); }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
