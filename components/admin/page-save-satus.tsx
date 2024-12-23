import { saveStatus$ } from "@/app/dashboard/state";
import { observer } from "@legendapp/state/react";

export const SaveStatus = observer(() => {
  const status = saveStatus$.get();

  return (
    <span className="text-sm italic text-gray-400">
      {status == "saved" && "Saved"}
      {status == "saving" && "Saving..."}
      {status == "unsaved" && "Unsaved"}
    </span>
  );
});
