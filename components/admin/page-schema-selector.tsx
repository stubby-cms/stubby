import { fetcher } from "@/lib/utils";
import { Schema } from "@prisma/client";
import { ChevronDown, Key } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export const PageSchemaSelector = ({ schemaId }: { schemaId: string }) => {
  const siteId = useParams().siteId as string;
  const nodeId = useSearchParams().get("id");
  const [loading, setLoading] = useState(false);
  const [currentSchemaId, setCurrentSchemaId] = useState(schemaId);

  const { data, isLoading } = useSWR<Schema[]>(
    `/api/site/${siteId}/schema`,
    fetcher,
  );

  const updateSchema = async (schemaId: string) => {
    if (schemaId === currentSchemaId) return;
    setLoading(true);
    setCurrentSchemaId(schemaId);

    const res = await fetch(`/api/site/${siteId}/nodes/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify({
        schemaId,
      }),
    });

    if (res.ok && res.status === 200) {
      toast.success("Schema updated");
      await mutate(`/api/site/${siteId}/nodes/${nodeId}`);
    } else {
      toast.error("Failed to update schema");
    }

    setLoading(false);
  };

  if (isLoading) return <div className="text-xs"></div>;

  return (
    <Select
      onValueChange={(val) => {
        updateSchema(val);
      }}
      value={currentSchemaId}
    >
      <SelectTrigger className="h-7 gap-0.5 border-none pl-2 pr-1.5 font-mono text-xs font-semibold uppercase tracking-widest hover:bg-secondary">
        {data?.find((schema) => schema.id === currentSchemaId)?.name ||
          "Schema"}
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading...">Loading...</SelectItem>
        ) : (
          data?.map((schema) => (
            <SelectItem value={schema.id} key={schema.id} className="font-mono">
              {schema.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
