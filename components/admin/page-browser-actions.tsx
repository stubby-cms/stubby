import { observer } from "@legendapp/state/react";
import { Spinner } from "../ui/spinner";
import { NewFolder } from "./icons";
import { NewFileDropdown } from "./new-file";
import { nodeMutationStatus$ } from "@/app/dashboard/state";

// Mutation status component, a loader when a file / folder is being deleted or added
const MutationStatus = observer(() => {
  const nodeMutationStatus = nodeMutationStatus$.get();

  return (
    <>
      {(nodeMutationStatus == "creating" ||
        nodeMutationStatus == "updating") && (
        <Spinner size={12} className="mr-2"></Spinner>
      )}
    </>
  );
});

export const PageBrowserActions = ({
  addFile,
  addFolder,
}: {
  addFile: (fileType: "db" | "json" | "file") => void;
  addFolder: () => void;
}) => {
  return (
    <div className="actions flex h-10 justify-between border-b pl-4 pr-2">
      <div className="flex items-center pt-0.5 text-[11px] font-semibold uppercase leading-none tracking-widest text-muted-foreground">
        Explorer
      </div>
      <div className="flex items-center gap-1">
        <MutationStatus />
        <NewFileDropdown addFile={addFile} />
        <button onClick={addFolder} className="mini-button">
          <NewFolder />
        </button>
      </div>
    </div>
  );
};
