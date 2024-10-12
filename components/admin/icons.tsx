interface IconProps {
  size?: number;
  className?: string;
}

export const Markdown = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path d="M6.345 5h2.1v6.533H6.993l.055-5.31-1.774 5.31H4.072l-1.805-5.31c.04.644.06 5.31.06 5.31H1V5h2.156s1.528 4.493 1.577 4.807L6.345 5zm6.71 3.617v-3.5H11.11v3.5H9.166l2.917 2.916L15 8.617h-1.945z" />
  </svg>
);

export const Mdx = (props: IconProps) => (
  <svg
    width={props.size || 40}
    height={props.size || 40}
    viewBox="0 -11.72 40 40"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    {...props}
  >
    <path
      d="M1.522.217h36.957c.72 0 1.305.585 1.305 1.305V15a1.305 1.305 0 0 1-1.305 1.305H1.522A1.305 1.305 0 0 1 .217 15V1.522C.217.802.802.217 1.522.217Z"
      fill="#FFF"
    />
    <path
      d="M1.522 0h36.957c.84 0 1.52.68 1.52 1.522V15a1.522 1.522 0 0 1-1.522 1.522H1.522A1.522 1.522 0 0 1 0 15V1.522C0 .68.68 0 1.522 0Zm0 .435A1.087 1.087 0 0 0 .435 1.522V15c0 .6.488 1.087 1.087 1.087h36.957c.6 0 1.087-.488 1.087-1.087V1.522A1.087 1.087 0 0 0 38.479.435H1.522Z"
      fill="#EAEAEA"
    />
    <path d="M21.305 3.14v6.633l2.438-2.435 1.23 1.23-4.502 4.502-4.56-4.56 1.23-1.23 2.43 2.427V3.14zM5.637 12.732V7.595l3.145 3.145 3.17-3.17v5.107h1.74V3.375l-4.91 4.908L3.9 3.397v9.335z" />
    <path
      fill="#F9AC00"
      d="m34.987 2.862 1.23 1.23-3.685 3.683 3.57 3.57-1.23 1.23-3.57-3.57-3.57 3.57-1.23-1.23 3.57-3.57-3.683-3.683 1.23-1.23 3.685 3.683z"
    />
  </svg>
);

export const Folder = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z" />
  </svg>
);

export const FolderOpened = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path d="M1.5 14h11l.48-.37 2.63-7-.48-.63H14V3.5l-.5-.5H7.71l-.86-.85L6.5 2h-5l-.5.5v11l.5.5zM2 3h4.29l.86.85.35.15H13v2H8.5l-.35.15-.86.85H3.5l-.47.34-1 3.08L2 3zm10.13 10H2.19l1.67-5H7.5l.35-.15.86-.85h5.79l-2.37 6z" />
  </svg>
);

export const NewFolder = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.5 2H7.71l-.85-.85L6.51 1h-5l-.5.5v11l.5.5H7v-1H1.99V6h4.49l.35-.15.86-.86H14v1.5l-.001.51h1.011V2.5L14.5 2zm-.51 2h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99zM13 16h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"
    />
  </svg>
);

export const NewFile = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"
    />
  </svg>
);

export const Edit = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.23 1H11.77L3.52002 9.25L3.35999 9.46997L1 13.59L2.41003 15L6.53003 12.64L6.75 12.48L15 4.22998V2.77002L13.23 1ZM2.41003 13.59L3.92004 10.59L5.37 12.04L2.41003 13.59ZM6.23999 11.53L4.46997 9.76001L12.47 1.76001L14.24 3.53003L6.23999 11.53Z"
    />
  </svg>
);

export const Trash = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 3H12H13V4H12V13L11 14H4L3 13V4H2V3H5V2C5 1.73478 5.10531 1.48038 5.29285 1.29285C5.48038 1.10531 5.73478 1 6 1H9C9.26522 1 9.51962 1.10531 9.70715 1.29285C9.89469 1.48038 10 1.73478 10 2V3ZM9 2H6V3H9V2ZM4 13H11V4H4V13ZM6 5H5V12H6V5ZM7 5H8V12H7V5ZM9 5H10V12H9V5Z"
    />
  </svg>
);
