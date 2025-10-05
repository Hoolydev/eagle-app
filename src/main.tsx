import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

createRoot(document.getElementById("root")!).render(
  convexUrl ? (
    <ConvexAuthProvider client={new ConvexReactClient(convexUrl)}>
      <App />
    </ConvexAuthProvider>
  ) : (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      color: "#1f2937",
      textAlign: "center"
    }}>
      <div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Configuração ausente</h1>
        <p>Defina a variável <code>VITE_CONVEX_URL</code> para iniciar o app.</p>
      </div>
    </div>
  )
);
