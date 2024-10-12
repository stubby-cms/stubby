export default function HomePage({ children }: { children?: React.ReactNode }) {
  return (
    <div className="m-page">
      <main className="pt-32">{children}</main>
    </div>
  );
}
