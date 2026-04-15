import { LiveForceDark } from "@/components/live/LiveForceDark";

export default function RadioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiveForceDark />
      {children}
    </>
  );
}
