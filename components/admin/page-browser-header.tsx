import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteSettingsDialog } from "../site/site-settings";
import { SitePicker } from "../site/sites-picker";
import { Settings } from "./icons";
import Image from "next/image";

export const PageBrowserHeader = () => {
  const siteId = useParams().siteId as string;

  return (
    <div className="flex items-center gap-2 py-2 pl-3.5 pr-2">
      <Link href={"/dashboard"} className="shrink-0">
        <Image
          src="/logo-small.svg"
          alt="Stubby logo"
          className="h-6"
          width={24}
          height={24}
        />
      </Link>
      <div className="-m-1 flex-1 overflow-hidden p-1">
        <SitePicker />
      </div>

      <SiteSettingsDialog
        siteId={siteId}
        trigger={
          <button className="mini-button shrink-0">
            <Settings size={19} />
          </button>
        }
      />
    </div>
  );
};
