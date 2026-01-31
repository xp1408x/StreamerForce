import ProductDetailClientContent from "./ProductDetailClientContent";

// 1. Forzamos a que no intente buscar parámetros en tiempo de ejecución
export const dynamicParams = false;

// 2. Le damos una ruta base. Esto genera el archivo [id]/index.html 
// que necesitamos para que Hostinger funcione con el .htaccess
export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default function Page() {
  return <ProductDetailClientContent />;
}