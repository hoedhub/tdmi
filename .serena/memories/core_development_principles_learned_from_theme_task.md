### Core Development Principles to Avoid Common Pitfalls

1.  **Holistic System View (Avoid Tunnel Vision):**
    *   **Problem:** Making local changes to shared/global configurations without considering systemic, ripple effects.
    *   **Solution:** Treat shared configurations (e.g., `tailwind.config.ts`, global styles, shared services) as high-risk areas. Before modifying, always ask: "What else uses this?" Isolate component-specific styles/logic within the component itself.

2.  **Strict Separation of Concerns:**
    *   **Problem:** Mixing responsibilities, e.g., making a structural component (like a layout) aware of presentational details (like a specific theme's name).
    *   **Solution:** Keep structure (HTML/Components) separate from presentation (CSS/Themes). Components should be generic and use semantic classes/props. The theme/style layer is responsible for defining what those classes/props do.

3.  **Centralized State Management:**
    *   **Problem:** Managing shared state in multiple, decentralized local variables, leading to synchronization issues.
    *   **Solution:** When multiple components need to access or modify the same data, use a single source of truth (e.g., Svelte Stores, Redux). Do not duplicate shared state.

4.  **Address Root Causes, Not Symptoms:**
    *   **Problem:** Applying complex "hacks" or patches to fix a surface-level issue, which often indicates a deeper architectural flaw.
    *   **Solution:** When a fix feels overly complicated or "dirty," stop and question the underlying architecture. A simple, elegant solution often requires fixing the root cause, not just the symptom.
