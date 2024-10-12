import { useParams } from "next/navigation";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CopyButton } from "../common/copy-button";
import useSWR from "swr";
import { Site } from "@prisma/client";
import { fetcher } from "@/lib/utils";

export const ShowApiEndPoint = ({ slug }: { slug: string }) => {
  const params = useParams();

  const siteId = params.siteId as string;
  const { data, isLoading } = useSWR<Site>(`/api/site/${siteId}`, fetcher);

  if (isLoading) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"link"}
          size={"sm"}
          className="h-5 px-0 text-muted-foreground"
        >
          Api
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[70vh] w-[500px] overflow-y-auto rounded-xl border"
        side="bottom"
        align="end"
      >
        <div className="flex flex-col gap-5 p-1">
          <div className="flex items-center gap-2 rounded-xl border p-2 text-sm">
            <span className="rounded-lg bg-brand px-2 py-0.5 text-xs font-semibold text-slate-900">
              GET
            </span>
            <span className="truncate font-mono">
              {`${process.env.NEXT_PUBLIC_HOST}/api/get`}
              <span className="text-brand">
                ?siteId={siteId}&pageSlug={slug}&apiKey={data?.apiKey}
                &requestFor=aPage
              </span>
            </span>
            <CopyButton
              className="shrink-0"
              value={`${process.env.NEXT_PUBLIC_HOST}/api/get?siteId=${siteId}&pageSlug=${slug}&apiKey=${data?.apiKey}&requestFor=aPage`}
            ></CopyButton>
          </div>
          <table className="table-default font-mono text-sm">
            <tr>
              <td className="text-muted-foreground">siteId</td>
              <td>{siteId}</td>
            </tr>
            <tr>
              <td className="text-muted-foreground">apiKey</td>
              <td>{data?.apiKey}</td>
            </tr>
            <tr>
              <td className="text-muted-foreground">action</td>
              <td>a_page</td>
            </tr>
            <tr>
              <td className="text-muted-foreground">slug</td>
              <td>{slug}</td>
            </tr>
          </table>
        </div>
      </PopoverContent>
    </Popover>
  );
};
