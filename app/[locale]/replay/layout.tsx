export default async function ReplayLayout({
    children
}: {
    children: React.ReactNode;
}) {
    // Simple passthrough layout - content is in individual pages
    return <>{children}</>;
}
