import { Suspense } from "react";

export default async function ProjectLayout({ children }) {
  return (
    <div className="mx-auto">
      <Suspense fallback={<div>Loading Projects...</div>}>{children}</Suspense>
    </div>
  );
}
