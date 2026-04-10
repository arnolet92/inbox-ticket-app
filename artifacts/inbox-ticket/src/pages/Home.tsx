import React from "react";
import { Link, useLocation } from "wouter";
import { Search, ArrowRight, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/layout";
import { Button, Input, Select } from "@/components/ui";
import { EventCard } from "@/components/EventCard";
import { QueueIllustration } from "@/components/QueueIllustration";
import { useListEvents } from "@workspace/api-client-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: events, isLoading } = useListEvents({ status: "upcoming" });
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cat = fd.get("category");
    const city = fd.get("city");
    const params = new URLSearchParams();
    if (cat) params.append("category", cat as string);
    if (city) params.append("search", city as string);
    setLocation(`/events?${params.toString()}`);
  };

  const featuredEvents = events?.slice(0, 3) || [];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden african-pattern-bg">
        {/* Background Image Setup */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
                <Ticket className="mr-2 h-4 w-4" /> La billetterie nouvelle génération
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-display leading-[1.1] mb-6">
                Vivez des moments <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-300">inoubliables.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                Découvrez les meilleurs événements, réservez vos places en quelques clics et payez facilement via Orange Money, MVola ou Mastercard.
              </p>
              
              <div className="glass-panel p-4 sm:p-6 rounded-2xl max-w-xl">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <Select name="category" className="bg-background/80 border-border/50 h-12 flex-1">
                    <option value="">Toutes catégories</option>
                    <option value="Concert">🎵 Concert</option>
                    <option value="Festival">🎪 Festival</option>
                    <option value="Sport">⚽ Sport</option>
                    <option value="Conférence">🎯 Conférence</option>
                    <option value="Soirée">🌙 Soirée</option>
                  </Select>
                  <Input 
                    name="city" 
                    placeholder="Ville (ex: Antananarivo)" 
                    className="bg-background/80 border-border/50 h-12 flex-1"
                  />
                  <Button type="submit" variant="accent" size="lg" className="h-12 w-full sm:w-auto px-8">
                    <Search className="h-5 w-5 mr-2" /> Rechercher
                  </Button>
                </form>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="rounded-3xl overflow-hidden border border-accent/15 shadow-2xl shadow-accent/10 bg-card/40 backdrop-blur-sm">
                <QueueIllustration />
              </div>
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 relative">
        <div className="african-pattern-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Événements à la une</h2>
              <p className="text-muted-foreground text-lg">Ne manquez pas les événements les plus attendus.</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="hidden sm:flex">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          
          <div className="mt-10 sm:hidden">
            <Link href="/events" className="w-full block">
              <Button variant="outline" className="w-full">
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
