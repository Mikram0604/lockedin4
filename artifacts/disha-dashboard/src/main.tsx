import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/fonts.css";
import "./styles/theme.css";
import "./index.css";
import "./pages/landing.css";

createRoot(document.getElementById("root")!).render(<App />);
