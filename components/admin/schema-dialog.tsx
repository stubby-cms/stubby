import { SchemaPage } from "@/app/dashboard/[siteId]/schema/schema-page";
import { schemaStore$ } from "@/app/dashboard/[siteId]/schema/state";
import { observer } from "@legendapp/state/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ArrowLeftIcon, LayersIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const SchemaDialogHeader = observer(() => {
  const schemaId = schemaStore$.currentlyEditingSchemaId.get();
  const schemas = schemaStore$.schemas.get();
  const schemaName = schemas[schemaId]?.name ?? "";

  return (
    <DialogHeader>
      <DialogTitle className="flex items-center">
        {schemaId ? (
          <button
            onClick={() => schemaStore$.currentlyEditingSchemaId.set(null)}
            className="-ml-1 mr-2 flex items-center justify-center rounded-full p-2 text-secondary-foreground hover:bg-secondary"
          >
            <ArrowLeftIcon size={18} />
          </button>
        ) : null}

        {schemaId ? (
          <>
            Edit schema —&nbsp;
            <span className="text-md font-mono">{schemaName}</span>
          </>
        ) : (
          "Schemas"
        )}
      </DialogTitle>
    </DialogHeader>
  );
});

export const SchemaEditorDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="list-button">
          <LayersIcon size={16} /> Schemas
        </button>
      </DialogTrigger>
      <DialogContent className="w-[50vw] max-w-full">
        <SchemaDialogHeader />
        <VisuallyHidden>
          <DialogDescription>
            Use the schema editor to create and edit schemas.
          </DialogDescription>
        </VisuallyHidden>

        <div className="h-1"></div>
        <SchemaPage />
        <div className="h-4"></div>
      </DialogContent>
    </Dialog>
  );
};
