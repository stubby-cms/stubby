"use client";

const Layer = ({
  size,
  style,
  storeOpacity,
}: {
  size: number;
  style: any;
  storeOpacity: number;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 193 193"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="spin-animation pointer-events-none absolute"
      style={style}
    >
      <path
        d="M135.486 41.8559L125.373 19.4661C114.098 -5.49817 78.6473 -5.49815 67.3722 19.4662L57.26 41.8559C54.1717 48.6939 48.6951 54.1704 41.8571 57.2588L19.4674 67.371C-5.49695 78.6461 -5.49693 114.097 19.4674 125.372L41.8571 135.484C48.6951 138.573 54.1717 144.049 57.26 150.887L67.3722 173.277C78.6473 198.241 114.098 198.241 125.373 173.277L135.486 150.887C138.574 144.049 144.051 138.573 150.889 135.484L173.278 125.372C198.243 114.097 198.243 78.6461 173.278 67.371L150.889 57.2588C144.051 54.1704 138.574 48.6939 135.486 41.8559Z"
        strokeOpacity={storeOpacity}
        strokeWidth="0.3"
        strokeLinejoin="round"
        className="stroke-[#000] dark:stroke-[#FFDD00]"
      />
    </svg>
  );
};

const CenterShape = ({
  size,
  style,
  ...props
}: {
  size: number;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 167 167"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animation-center absolute"
      style={style}
      {...props}
    >
      <path
        d="M58.7426 17.1909C68.3184 -4.01123 98.427 -4.01125 108.003 17.1909L116.728 36.5101C119.436 42.506 124.239 47.3081 130.234 50.0162L149.554 58.7416C170.756 68.3175 170.756 98.4261 149.554 108.002L130.234 116.727C124.239 119.435 119.436 124.238 116.728 130.233L108.003 149.553C98.427 170.755 68.3185 170.755 58.7426 149.553L50.0171 130.233C47.3091 124.238 42.507 119.435 36.5111 116.727L17.1919 108.002C-4.01025 98.4261 -4.01027 68.3175 17.1919 58.7416L36.5111 50.0162C42.507 47.3081 47.3091 42.506 50.0171 36.5101L58.7426 17.1909Z"
        className="center-shape"
      />
    </svg>
  );
};

export default function FancyAnimation() {
  const arr = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="anim-container">
      <CenterShape
        size={128}
        onMouseEnter={() => {
          document.querySelector(".anim-container")?.classList.add("hovered");
        }}
        onMouseLeave={() => {
          document
            .querySelector(".anim-container")
            ?.classList.remove("hovered");
        }}
      />
      {arr.map((_, i) => (
        <Layer
          key={i}
          size={193 + i * 30}
          storeOpacity={0.4 - i * 0.02}
          style={{
            "--delay": `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}
