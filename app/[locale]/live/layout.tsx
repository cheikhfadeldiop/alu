import { LiveForceDark } from "@/components/live/LiveForceDark";

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiveForceDark />
      {children}
    </>
  );
}
