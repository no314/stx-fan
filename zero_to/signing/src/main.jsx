// Entry point. Import order matters:
// 1. styles — tokens.css (design tokens + fonts) before app.css (component recipes);
// 2. vendored side-effect scripts — contract sources (window.ZTS_CONTRACTS) and the
//    structure-hash function from old app 03 (window.ZTSHash, byte-for-byte, unmodified);
// 3. the wallet/chain bridge (window.ZTSLib);
// 4. the app.
import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/tokens.css";
import "@phosphor-icons/web/regular";
import "./styles/app.css";

import "./vendor/contract-sources.js";
import "./vendor/structure-hash.js";
import "./lib.js";

import { App } from "./app.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
