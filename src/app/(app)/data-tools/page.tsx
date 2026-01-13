import { ImportExportCard } from "@/components/data-tools/ImportExportCard";
import { WebScraperCard } from "@/components/data-tools/WebScraperCard";

export default function DataToolsPage() {
  return (
    <div className="h-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Herramientas de Datos</h1>
        <p className="text-muted-foreground">
          Importa, exporta y busca contactos automáticamente.
        </p>
      </div>
      
      <WebScraperCard />
      <ImportExportCard />
    </div>
  );
}
