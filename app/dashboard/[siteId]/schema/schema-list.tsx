import { fetcher } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import { Schema } from "@prisma/client";
import { ArrowRight, LayersIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";
import { schemaActions } from "./state";
import { SchemaNew } from "./schema-new";

function SchemaCard({ data }: { data: Schema }) {
  return (
    <li>
      <button
        className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border p-4 text-left font-medium shadow-sm hover:bg-secondary"
        onClick={() => {
          schemaActions.currentlyEditingSchemaId(data.id);
        }}
      >
        <LayersIcon size={18} />
        <div className="flex-1 truncate font-mono">{data.name}</div>
        <ArrowRight size={20} />
      </button>
    </li>
  );
}

export const SchemaList = observer(() => {
  const siteId = useParams().siteId as string;

  const { data, isLoading } = useSWR<Schema[]>(
    `/api/site/${siteId}/schema`,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      schemaActions.populateFromServer(data as Schema[]);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Failed to load schema list</div>;

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg font-medium">No schemas yet!</div>
          <div className="text-md mt-2 text-muted-foreground">
            Schemas help you create a structure for your pages or collections.
          </div>

          <div className="mt-4">
            <SchemaNew
              trigger={
                <button className="rounded-2xl border border-dashed border-border hover:bg-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 flex-col px-4 py-2">
                      <div className="flex items-center gap-2 font-medium">
                        <PlusIcon size={18} />
                        <span className="font-mono">Add your first schema</span>
                      </div>
                    </div>
                  </div>
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ul className="grid grid-cols-3 gap-4">
        {data.map((schema) => (
          <SchemaCard key={schema.id} data={schema} />
        ))}

        <SchemaNew />
      </ul>
    </div>
  );
});
