import { BookOpenTextIcon } from "lucide-react";
import Link from "next/link";
import { ApiPlaygroundDialog } from "./api-playground-dialog";
import { SchemaEditorDialog } from "./schema-dialog";

export const PageBrowserFooter = () => {
  return (
    <div className="flex w-full flex-col border-t">
      <ul className="flex flex-col gap-1 px-3 pt-2">
        <SchemaEditorDialog />
        <ApiPlaygroundDialog />
        <li>
          <Link href={"/docs"} target="_blank" className="list-button">
            <BookOpenTextIcon size={16} /> Documentation
          </Link>
        </li>
      </ul>
    </div>
  );
};
