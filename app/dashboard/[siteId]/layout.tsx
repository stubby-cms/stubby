import Nodes from "@/components/admin/nodes";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense } from "react";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="full-chrome">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={15} maxSize={30} minSize={4}>
            <Suspense fallback={null}>
              <Nodes />
            </Suspense>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={85}>{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
