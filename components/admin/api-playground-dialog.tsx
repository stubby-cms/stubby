import { PlaygroundPage } from "@/app/dashboard/[siteId]/playground/play-ground-page";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CableIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

export const ApiPlaygroundDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="list-button">
          <CableIcon size={16} /> API Playground
        </button>
      </DialogTrigger>
      <DialogContent className="w-[80vw] max-w-full p-0">
        <VisuallyHidden>
          <DialogTitle>API Playground</DialogTitle>
          <DialogDescription>
            Use the API Playground to test your API requests.
          </DialogDescription>
        </VisuallyHidden>
        <PlaygroundPage />
      </DialogContent>
    </Dialog>
  );
};
