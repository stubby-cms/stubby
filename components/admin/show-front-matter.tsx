import { isArray, isObject } from "lodash";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const ShowFrontMatter = ({ data }: { data: any }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"link"}
          size={"sm"}
          className="h-5 px-0 text-muted-foreground"
        >
          Metadata
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[70vh] w-[400px] overflow-y-auto rounded-xl border"
        side="bottom"
        align="end"
      >
        <div className="flex flex-col gap-5 p-1">
          {data &&
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{key}</span>
                <span className="text-sm">
                  {typeof value == "string" && value}
                  {typeof value == "boolean" && value.toString()}
                  {typeof value == "number" && value.toString()}
                  {isArray(value) && value.join(", ")}
                  {!isArray(value) && isObject(value) && (
                    <pre className="text-xs">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </span>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
