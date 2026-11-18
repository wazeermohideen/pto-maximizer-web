import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import "./index.css";

function App() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Card className="border-border">
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">PTO Maximizer</h1>
          <CardDescription>
            Find which workdays to take off to get a longer break around weekends and holidays.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
