import ServerDetailClientContent from "./ServerDetailClientContent";

// Evita que Next.js intente renderizar esto en el servidor
export const dynamicParams = false;

// Proporcionamos el molde estático sin consultar la base de datos
export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default function ServerDynamicPage() {
  return <ServerDetailClientContent />;
}