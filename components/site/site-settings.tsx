"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { AlertTriangle, Cable, KeyRound, Settings } from "lucide-react";
import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ApiKeysSettings } from "./settings/api-keys";
import { DangerSettings } from "./settings/danger";
import { GeneralSettings } from "./settings/general";
import { WebhookSettings } from "./settings/webhook";
import { useRouter } from "next/navigation";

export const SiteSettingsPageHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <header className="settings-header px-8">
      <h3 className="mb-2 text-2xl font-semibold">{title}</h3>
      <p className="text-md text-muted-foreground">{description}</p>
    </header>
  );
};

const SiteSettings = ({ onDeleted }: { onDeleted: () => void }) => {
  const iconSize = 16;
  const tabs = [
    {
      label: "General",
      icon: <Settings size={iconSize} />,
      value: "general",
    },
    {
      label: "API Keys",
      icon: <KeyRound size={iconSize} />,
      value: "api-keys",
    },
    {
      label: "Webhook",
      icon: <Cable size={iconSize} />,
      value: "webhook",
    },
    {
      label: "Delete",
      icon: <AlertTriangle size={iconSize} />,
      value: "delete",
    },
  ];

  return (
    <Tabs defaultValue="overview">
      <div className="rounded-4xl h-[80vh] overflow-hidden">
        <div className="flex h-full">
          <div className="w-[260px] border-r pt-10 text-[14px]">
            <div className="text-md mb-3 pl-6 font-medium text-slate-500">
              Site settings
            </div>
            <TabsList className="flex flex-col px-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.label}
                  value={tab.value}
                  className="tab-button"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="w-full overflow-y-auto">
            <div className="pb-8 pr-10 pt-12">
              <TabsContent value="general">
                <GeneralSettings />
              </TabsContent>
              <TabsContent value="api-keys">
                <ApiKeysSettings />
              </TabsContent>
              <TabsContent value="webhook">
                <WebhookSettings />
              </TabsContent>
              <TabsContent value="delete">
                <DangerSettings onDeleted={onDeleted} />
              </TabsContent>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
};

export const SiteSettingsDialog = ({
  siteId,
  trigger,
}: {
  siteId: string;
  trigger?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button className="icon-button">
            <Settings size={18} />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        hideClose={true}
        className="max-w-[80vw] p-0 sm:shadow-none lg:max-w-[60vw]"
      >
        <DialogDescription className="sr-only">Settings</DialogDescription>
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <SiteSettings
          onDeleted={() => {
            router.push("/dashboard");
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
