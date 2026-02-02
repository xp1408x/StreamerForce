import StreamerClientContent from "./StreamerClientContent";

// Forzamos a que la página no se intente pre-renderizar en el build
export const dynamic = 'force-dynamic';

export default function Page() {
  return <StreamerClientContent />;
}