import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main>
      <p>Streaming Audio Playground</p>
      <h1>Ready for the first stream.</h1>
      <p>
        The React client is connected to the project shell. Audio controls arrive in the next step.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
