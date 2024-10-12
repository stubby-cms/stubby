import { NewFile, NewFolder } from "./icons";

export const NodesSkeleton = () => {
  return (
    <div
      className="flex flex-col bg-background"
      style={{ height: "calc(100vh - 84px)" }}
    >
      <div className="actions flex h-8 items-center border-b-2">
        <div className="flex w-full items-center justify-between pl-4 pr-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Explorer
          </span>
          <div className="flex gap-1">
            <button className="mini-button">
              <NewFile />
            </button>
            <button className="mini-button">
              <NewFolder />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 pt-3">
        <div className="sk h-4 rounded-xl" style={{ width: "40%" }}></div>
        <div className="sk ml-6 h-4 rounded-xl" style={{ width: "60%" }}></div>
        <div className="sk ml-6 h-4 rounded-xl" style={{ width: "55%" }}></div>
        <div className="sk ml-6 h-4 rounded-xl" style={{ width: "39%" }}></div>
        <div className="sk h-4 rounded-xl" style={{ width: "48%" }}></div>
        <div className="sk ml-6 h-4 rounded-xl" style={{ width: "60%" }}></div>
        <div className="sk ml-6 h-4 rounded-xl" style={{ width: "40%" }}></div>
      </div>
    </div>
  );
};

export const MdSkeleton = () => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="prose p-10">
        <div className="sk h-10 rounded-2xl" />
        <div className="h-10"></div>
        <div className="flex flex-col gap-3">
          <div className="sk h-4 w-[90%] rounded-2xl" />
          <div className="sk h-4 w-[95%] rounded-2xl" />
          <div className="sk h-4 w-[87%] rounded-2xl" />
          <div className="sk h-4 w-[80%] rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const EditorSkeleton = () => {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="prose p-10">
        <div className="flex flex-col gap-3">
          <div className="sk h-1 w-[5%] rounded-2xl" />
          <div className="flex gap-4">
            <div className="sk h-4 w-[20%] rounded-2xl" />
            <div className="sk h-4 w-[30%] rounded-2xl" />
          </div>
          <div className="flex gap-4">
            <div className="sk h-4 w-[15%] rounded-2xl" />
            <div className="sk h-4 w-[28%] rounded-2xl" />
          </div>
          <div className="sk h-1 w-[5%] rounded-2xl" />
          <div className="h-6"></div>
          <div className="flex flex-col gap-3">
            <div className="sk h-3 w-[90%] rounded-2xl" />
            <div className="sk h-3 w-[95%] rounded-2xl" />
            <div className="sk h-3 w-[87%] rounded-2xl" />
            <div className="sk h-3 w-[80%] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
