import clsx from "clsx";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner = (props: SpinnerProps) => {
  const { size = 20, color = "#000", className = "" } = props;

  return (
    <svg
      height={`${size}px`}
      width={`${size}px`}
      className={clsx("spinner", className)}
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
      style={{ "--color": color } as any}
    >
      <circle
        className={"path"}
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30"
      ></circle>
    </svg>
  );
};

export { Spinner };
