import ArticleClientContent from "./ArticleClientContent";

// ¡ESTO ES TODO! No necesitas generateStaticParams ni dynamicParams.
// Next.js recibirá el slug automáticamente.
export default function Page() {
  return <ArticleClientContent />;
}