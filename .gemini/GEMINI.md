#### 🚀 Core Principles  
_Foundational rules for consistency, stability, and alignment._  

1. **Follow Requirements & Patterns**  
   - Start with PRD/README. Replicate existing patterns/logic before creating new solutions.  
   - For conflicting patterns, use README guidance or the most recently modified implementation.
   - If for some reasons you must make changes that don't align with the README/PRD, update the README/PRD to reflect the changes.
   -Record changes, at least the key changes in a worklog file `/worklogs.md` for "what" and "why" with timestamp.
   - Always review `/worklogs.md` (create it if not exists) before planning changes to keep yourself in context.

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
- ✅ **DRY (Don’t Repeat Yourself)**: Eliminate duplication; reuse existing logic.  
- ✅ **Comments**: Explain *why* (complex logic/business rules), not *what*.  
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