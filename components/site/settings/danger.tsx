import { DeleteSite } from "../delete-site";
import { SiteSettingsPageHeader } from "../site-settings";

export const DangerSettings = ({ onDeleted }: { onDeleted: () => void }) => {
  return (
    <>
      <SiteSettingsPageHeader
        title="Danger zone"
        description=" In this section you have the ability to delete your site."
      />

      <div className="h-8"></div>

      <div className="px-7">
        <div className="flex flex-col rounded-xl border p-4 shadow-sm">
          <h3 className="font-medium">Delete site</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Deletes your site and the data (pages, images, settings) associated
            with it.
          </p>
          <div className="mt-3">
            <DeleteSite onDeleted={onDeleted} />
          </div>
        </div>
      </div>
    </>
  );
};
