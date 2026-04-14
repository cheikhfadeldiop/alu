import { NewsTopBarShell } from "@/components/news/NewsTopBarShell";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NewsTopBarShell />
      {children}
    </>
  );
}
