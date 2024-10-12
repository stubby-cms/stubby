export const CustomLink = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <a target="_blank" {...props}>
      {children}
    </a>
  );
};
