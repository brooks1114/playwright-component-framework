# Persistent Project Directive – Playwright + React Testing Framework

As a principal engineer, I'm designing and building a best-in-class Playwright-based testing framework for a React component-based UI application, targeting Fortune 100 tech company standards. The framework must adhere to industry best practices for scalability, maintainability, and reliability, with a focus on long-term AI-assisted development.Core ArchitectureComponent Object Model (COM): Prioritize a COM structure for React-specific testing. This involves creating modular classes or wrappers that model individual React components (e.g., ButtonComponent, FormComponent) with methods for interactions, assertions, and state management tailored to React's virtual DOM and hooks. Use Playwright's React locator extensions (e.g., \_react=ComponentName) where available for precise selection. COM promotes reusability across tests by abstracting component-level logic.
Page Object Model (POM) Fallback: Use POM as a secondary pattern for page-level orchestration or when COM is insufficient (e.g., for non-React elements, complex page flows, or legacy UI parts). POM classes (e.g., LoginPage) compose COM objects where possible, falling back to standard locators (CSS, XPath) only if React-specific selectors fail or are unavailable.
Hybrid Integration: Ensure seamless interoperability—COM objects can be instantiated within POM classes. Handle fallbacks gracefully with runtime checks (e.g., try React locator, catch and use POM equivalent).

Playwright Versioning Do not hardcode specific Playwright versions in code or prompts. Always reference and use the most recent stable release available at the time of code generation, updates, or maintenance. When assisting, dynamically query for the latest version (e.g., via npm registry or Playwright docs) to incorporate new features, deprecations, or breaking changes. Include version-agnostic wrappers to minimize upgrade impacts.

Code StandardsClasses: Follow SOLID principles, use TypeScript for type safety, and implement design patterns like COM/POM for UI interactions.
Functions: Keep them small and single-responsibility (aim for <50 lines), with:Inline JSDoc-style comments explaining purpose, parameters, return values, and edge cases in simple language suitable for a junior engineer.
Usage examples embedded in comments (e.g., via code snippets).

Structure for AI Compatibility: Organize code in modular files (e.g., one class/function per file or section), with clear headers, consistent naming conventions (e.g., camelCase for variables, PascalCase for classes), and self-contained modules that can be directly copied/pasted into an AI like Grok for analysis, generation, or refactoring. Include import statements and exports for easy replication.

ABSOLUTE RULE: EVERY class and EVERY method MUST have full JSDoc documentation including:

- Purpose / what it does
- Parameters with types and description
- Return value
- @example blocks with realistic usage (preferably with ComponentFactory)
- Edge cases / notes where relevant

Do NOT omit documentation from any method, even during refactors or improvements.
When editing a class, preserve and expand comments — never remove them.

Full JSDoc + examples on EVERY method — no exceptions. Redo ButtonBase with complete documentation.

Always add new functions if they belong in the class I am providing to you. I would rather have functions in the class that are never used, or not used for a year or two. It is better to have the function already available for engineers so they do not need to waste time creating functions. Can you revisit link-base and if there are playwright functions available that would fit this class / pattern

Now review/update the following class with full documentation:
