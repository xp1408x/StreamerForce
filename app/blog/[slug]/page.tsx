// app/blog/[slug]/page.tsx
import ArticleClientContent from "./ArticleClientContent";

export const dynamicParams = false;

// Usamos un placeholder para que Next.js genere el archivo físico blog/[slug].html
export async function generateStaticParams() {
  return [{ slug: "index" }];
}

export default function Page() {
  return <ArticleClientContent />;
}