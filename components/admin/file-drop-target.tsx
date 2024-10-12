import React, { DragEvent } from "react";

export const FileDropTarget = (props: {
  children: React.ReactNode;
  onDrop: (file: File) => void;
  regex?: RegExp;
  className?: string;
  disabled?: boolean;
}) => {
  let enterLeaveTimeout: any = null;

  const [isActive, setIsActive] = React.useState(false);

  const onDragEnter = (ev: DragEvent) => {
    if (props.disabled) {
      return;
    }

    ev.preventDefault();
    if (enterLeaveTimeout) {
      clearTimeout(enterLeaveTimeout);
      enterLeaveTimeout = null;
    }
    setIsActive(true);
  };

  const onDragLeave = (ev: DragEvent) => {
    ev.preventDefault();
    if (enterLeaveTimeout) {
      clearTimeout(enterLeaveTimeout);
    }
    enterLeaveTimeout = setTimeout(() => {
      setIsActive(false);
    }, 10);
  };

  const onDragOver = (ev: DragEvent) => {
    ev.preventDefault();
    if (enterLeaveTimeout) {
      clearTimeout(enterLeaveTimeout);
      enterLeaveTimeout = null;
    }
    ev.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (ev: DragEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    if (props.disabled) {
      return;
    }

    let fileNameRegexp = props.regex || /.*/;

    setIsActive(false);

    if (
      ev.dataTransfer.files.length == 1 &&
      ev.dataTransfer.files[0].name.match(fileNameRegexp)
    ) {
      props.onDrop(ev.dataTransfer.files[0]);
    } else {
      //   alert(this.props.invalidFileMessage);
    }
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {props.children}
    </div>
  );
};
