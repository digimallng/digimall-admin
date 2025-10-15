export default function ApiTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple passthrough layout - styles come from root layout
  return <>{children}</>;
}
