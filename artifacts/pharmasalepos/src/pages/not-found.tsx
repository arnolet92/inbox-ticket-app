import React from "react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/layout";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-8xl font-bold font-display text-accent mb-4">404</div>
        <h1 className="text-3xl font-bold font-display mb-2">Page introuvable</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button variant="accent" size="lg">Retour à l'accueil</Button>
        </Link>
      </div>
    </PublicLayout>
  );
}
