import ProductDetailClientContent from "./ProductDetailClientContent";

// 1. Forzamos a que no intente buscar parámetros en tiempo de ejecución
export const dynamicParams = false;

export default function Page() {
  return <ProductDetailClientContent />;
}