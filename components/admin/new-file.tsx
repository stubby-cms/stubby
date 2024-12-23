import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Db, Markdown, NewFile } from "./icons";

export const NewFileDropdown = ({
  addFile,
}: {
  addFile: (type: "file" | "db" | "json") => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="mini-button">
          <NewFile />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-[200px] flex-col justify-center gap-2 p-2"
        align="center"
      >
        <button
          className="dropdown-item-button"
          onClick={() => addFile("file")}
        >
          <Markdown size={20} />
          Markdown file
        </button>
        <button className="dropdown-item-button" onClick={() => addFile("db")}>
          <Db size={20} />
          Database file
        </button>
      </PopoverContent>
    </Popover>
  );
};
