#### 🚀 Core Principles

_Foundational rules for consistency, stability, and alignment._

1. **Follow Requirements & Patterns (Prinsip DRY)**
   - **Prinsip Utama**: Selalu prioritaskan penggunaan kembali logika, pola, dan komponen yang sudah ada sebelum membuat yang baru (Don't Repeat Yourself). Replikasi pola/logika yang ada sebelum membuat solusi baru.
   - **Alur Kerja Pengembangan**:
     1. **Pahami Kebutuhan**: Analisis permintaan untuk mengidentifikasi fungsionalitas yang dibutuhkan.
     2. **Cari Komponen Internal**: Lakukan pencarian di `src/lib/components/` dan `src/lib/utils/` untuk solusi yang ada. Komponen utama meliputi `SuperTable`, `data-entry/*`, `layout/*`, dan `toast`.
     3. **Periksa Dependensi**: Lihat `package.json` untuk fungsionalitas yang mungkin sudah disediakan oleh library yang ada (SvelteKit, Drizzle, Lucia-auth, Tailwind CSS).
     4. **Buat Baru (Jika Perlu)**: Hanya jika tidak ada solusi, buat komponen baru dengan meniru gaya dan pola kode yang ada.
   - **Sumber Kebenaran**: `README.md` adalah acuan utama. Jika ada konflik, gunakan implementasi terbaru. Perubahan signifikan yang menyimpang dari pola harus dicatat di `/worklogs.md`.

---

2. **Strict Scope**
   - Only modify code directly relevant to the task. Avoid unrelated changes.
3. **Simplicity & Stability**
   - Fix root causes directly. Complexity requires justification (performance, security, scalability).
   - Document tradeoffs when introducing complexity.
4. **Remove Old Implementations**
   - Delete deprecated code during refactors to reduce maintenance overhead.
5. **Performance Mindset**
   - Avoid computationally expensive operations in loops/APIs.
   - Prevent N+1 queries via eager loading/batching.
   - Use `async/await`; never block the main thread.
6. **Never Make Assumption**
   - If you don't understand or not sure of what the user means, ask for clarification.
7. **Holistic UI/UX Context**
   - When providing solutions, always consider good UI/UX in the context of the entire related page and, if necessary, the entire application.
8. **UI/UX Animation & Feedback Preferences**
   - **Transitions**: Prefer `slide` transitions. Ensure surrounding elements are affected by the transition and move smoothly with it.
   - **Feedback**: Informational/warning feedback (non-errors) should be noticeable but less dramatic than error messages.
9. **Proactive & Efficient Memory Management**
   - Actively identify important information (behavioral rules or project facts).
   - Propose saving this information to the appropriate location (`GEMINI.md` for rules, Serena memory for facts) to ensure memory is relevant and not bloated.
10. **Evaluasi Kritis & Solusi Alternatif**
    - Jangan secara otomatis menyetujui atau melaksanakan setiap permintaan.
    - Lakukan evaluasi kritis terhadap potensi dampak negatifnya (misalnya, terhadap performa, keterbacaan kode, UI/UX, keamanan, atau utang teknis).
    - Jika sebuah permintaan dinilai kurang ideal, sampaikan alasannya dengan jelas dan logis.
    - Selalu usulkan solusi alternatif yang lebih baik, lebih aman, atau lebih selaras dengan tujuan jangka panjang proyek.

---

#### 🧠 Core Development Principles (Learned from Experience)

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

---

#### 🔒 Security & Credentials

_Non-negotiable practices._

1. **Never Hardcode Secrets**
   - Use environment variables/secrets management services.
2. **Sanitize All Inputs**
   - Validate/sanitize external data (user inputs, APIs, file uploads) to prevent XSS/SQLi.
3. **Principle of Least Privilege**
   - Grant minimal permissions for APIs, access controls, and scopes.
4. **Dependency Security**
   - Scan for vulnerabilities; update/replace insecure packages promptly.

---

#### 🛠️ Development Workflow

_Code quality, testing, and environments._

**Server Management**

- Kill all related servers before restarting.
- Restart servers after changes to enable testing.

**Code Quality**

- ✅ **Linting/Formatting**: Strict adherence to project standards.
- ✅ **Comments**: Explain _why_ (complex logic/business rules), not _what_.
- 📏 **File Size Limits**:
  - Components/utilities: `≤ 300 lines`
  - Config files: `≤ 150 lines`
  - Tests: `≤ 500 lines` (exceptions require documentation).

**Testing**

- **Coverage**:
  - Unit tests: ≥80% coverage.
  - Integration/e2e tests for critical paths.
- **Quality**:
  - Cover success + failure cases (invalid inputs, edge cases).
  - Include performance benchmarks for resource-heavy features.
- **No Mock Data Outside Tests**:
  - Never use mocks/stubs in dev/prod.

**Environments**

- Support `dev`, `test`, `prod` with environment-specific configs.
- Never commit `.env` files.

---

#### 🤝 Collaboration & Review

_Team standards for code management._

1. **Mandatory Code Reviews**
   - All changes require ≥1 reviewer approval before merge.
2. **Atomic Commits**
   - Format: `type(scope): description` (e.g., `fix(auth): patch token expiry`).
3. **Pull Requests**
   - Include: Issue links, testing steps, and impact analysis.
4. **Git Hygiene**
   - No unstaged/untracked files post-commit.
   - Use `.gitignore` rigorously.
   - No new branches without explicit request.

---

#### ⚡ Performance & Resilience

_Building robust, efficient systems._

1. **API/Service Interactions**
   - Timeouts + retries (exponential backoff) for transient errors (502/503).
   - Gracefully handle 4xx/5xx responses; never crash on failures.
2. **Circuit Breakers**
   - Implement for external service dependencies.
3. **Monitoring**
   - Logging/alerting for memory, DB queries, API latency.
4. **Graceful Degradation**
   - Fallback mechanisms during failures.

---

#### 📚 Documentation & Problem Solving

_Knowledge sharing and troubleshooting._

1. **Problem Solving**
   - Troubleshoot via logging; verify fixes in logs.
   - Research solutions with Firecrawl when stuck.
2. **Documentation**
   - **Fixes**: Record solutions in `/fixes/*.md` for recurring issues.
   - **ADRs**: Document architecture decisions and rationale.
   - **APIs**: Maintain updated schemas/examples.
   - **READMEs**:
     - List current patterns/technologies.
     - Outline setup, testing, and contribution steps.

---

#### ♻️ Project Maintenance

_Keeping the project healthy._

1. **Dependencies**
   - Vet new packages (prefer widely used/libs).
   - Use lock files (`package-lock.json`, `yarn.lock`).
   - Update regularly for security/performance.
2. **Technical Debt**
   - Track and address quarterly.
3. **Optimization**
   - Continuously monitor/optimize based on usage patterns.

---