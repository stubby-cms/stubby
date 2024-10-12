import type { editor } from "monaco-editor";
import type { DragEvent, MutableRefObject } from "react";

export type TDropHandler = (
  e: React.DragEvent<HTMLDivElement>,
  target: editor.IMouseTarget,
  instance: editor.IStandaloneCodeEditor,
) => void;

export type TInstanceRef =
  MutableRefObject<editor.IStandaloneCodeEditor | null>;

type DndControllerState = {
  target: editor.IMouseTarget | null;
  node: HTMLDivElement | null;
  widget: editor.IContentWidget | null;
};

export function createDndController(
  instanceRef: TInstanceRef,
  handler: TDropHandler,
) {
  const state: DndControllerState = {
    target: null,
    node: null,
    widget: null,
  };

  const onDragOver = (ev: DragEvent<HTMLDivElement>) => {
    if (!instanceRef.current) return;
    const instance = instanceRef.current;

    const target = instance.getTargetAtClientPoint(ev.clientX, ev.clientY);

    showDropPosition(instance, target!);
    ev.preventDefault();
  };

  const onDrop = (ev: DragEvent<HTMLDivElement>) => {
    if (!instanceRef.current || !state.target) return;
    handler && handler(ev, state.target, instanceRef.current);
    onCleanup();
  };

  const createMouseDropWidget = () => {
    if (!state.node) {
      state.node = document.createElement("div");
      state.node.className = "drop";
      state.node.style.pointerEvents = "none";
      state.node.style.borderLeft = "2px solid #ccc";
      state.node.innerHTML = "&nbsp;";
    }

    return {
      getId: () => "drag",
      getDomNode: () => state.node as HTMLDivElement,
      getPosition: () => ({
        position: state.target!.position,
        preference: [0, 0],
      }),
    };
  };

  const showDropPosition = (
    instance: editor.IStandaloneCodeEditor,
    target: editor.IMouseTarget,
  ) => {
    state.target = target;

    if (state.widget) {
      instance.layoutContentWidget(state.widget);
    } else {
      state.widget = createMouseDropWidget();
      instance.addContentWidget(state.widget);
    }
  };

  const onCleanup = () => {
    const instance = instanceRef.current;
    if (instance && state.widget && state.node) {
      instance.removeContentWidget(state.widget);
      state.widget = null;
    }
  };

  const getContainerProps = () => ({
    onDragOver,
    onDropCapture: onDrop,
    onDragLeaveCapture: onCleanup,
  });

  return {
    getContainerProps,
  };
}
