// app/streamers/[slug]/page.tsx
import StreamerClientContent from "./StreamerClientContent";

export const dynamicParams = false;

// No consultes la DB aquí. Solo dale un "molde" vacío.
export async function generateStaticParams() {
  return [{ slug: "index" }]; 
}

export default function Page() {
  return <StreamerClientContent />;
}