import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import "tailwindcss/tailwind.css";

import { TestApplication } from "./application";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
	throw new Error("No root element found");
}

const root = createRoot(container);

root.render(
	<StrictMode>
		<TestApplication />
	</StrictMode>,
);
