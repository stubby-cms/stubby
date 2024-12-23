"use client";

import { fetcher } from "@/lib/utils";
import { Site } from "@prisma/client";
import Link from "next/link";
import useSWR from "swr";
import { Spinner } from "../ui/spinner";
import { ArrowRight } from "lucide-react";

function SiteCard({ data }: { data: Site }) {
  return (
    <div className="rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/${data.id}/content`}
          className="flex flex-1 flex-col p-4"
        >
          <div className="font-medium">{data.name}</div>
          <div className="text-sm text-muted-foreground">
            {data.description}
          </div>
        </Link>

        <div className="pr-4 text-sm text-gray-500">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
}

export function SitesList() {
  const {
    data: sites,
    error,
    isLoading,
  } = useSWR<Site[]>("/api/site", fetcher);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        Error loading sites
      </div>
    );
  }

  return (
    <>
      {sites && sites.length > 0 ? (
        <div className="grid grid-cols-2 gap-5">
          {sites.map((site) => (
            <SiteCard key={site.id} data={site} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col rounded-2xl border p-10">
          <h3 className="text-lg font-medium">No sites yet</h3>
          <p>You do not have any sites yet. Create one to get started.</p>
        </div>
      )}
    </>
  );
}
