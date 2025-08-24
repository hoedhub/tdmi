# Serena Tools Documentation Summary

This document summarizes the core concepts and functionalities of the Serena toolset, an AI code assistant CLI that provides Large Language Models (LLMs) with semantic understanding of a codebase.

---

### I. Core Principles & Concepts

1.  **Semantic Understanding**: Serena uses the Language Server Protocol (LSP) to parse code at a symbolic level (functions, classes, variables) rather than as plain text. This allows for more intelligent and precise operations.
2.  **IDE-like Capabilities**: It equips the LLM with tools to perform actions similar to a human developer using an IDE, such as "find all references" or "go to definition."
3.  **Efficiency**: By providing only relevant code snippets (symbols) instead of entire files, it drastically reduces the token count, leading to faster and more cost-effective interactions.
4.  **MCP Server**: Serena runs as a Model Context Protocol (MCP) server, which the AI client connects to. This server exposes the available tools to the AI.
5.  **Project Indexing**: For larger projects, running `serena project index` is highly recommended to speed up tool operations by pre-processing the codebase.

---

### II. Tool Categories & Workflow

The tools can be grouped into a logical workflow for tackling development tasks:

#### 1. Code Understanding & Analysis

These tools are used to explore and understand the codebase. It's best practice to start here before making any changes.

*   **`get_symbols_overview`**: The first tool to use on a new file. It provides a high-level summary of the top-level symbols (classes, functions, etc.) within that file.
*   **`find_symbol`**: Finds specific code symbols (e.g., a function named `getUser`) within a file or the entire project. It uses a `name_path` (e.g., `ClassName/methodName`) which represents the symbol's path in the code's structure, **not** a file system path.
*   **`find_referencing_symbols`**: Finds all the places in the code that reference a specific symbol. Extremely useful for understanding the impact of a potential change.
*   **`search_for_pattern`**: A flexible, regex-based search for arbitrary text. This is useful for finding things that aren't symbols, such as configuration strings, comments, or searching in non-code files (e.g., `.md`, `.yml`).
*   **`read_file`**: Reads the raw content of a file. This should be used when you need to see the entire file content, including comments and structure that symbol-based tools might omit.
*   **`list_dir`**: Lists the files and directories within a given path.

#### 2. Code Modification

Once the code is understood, these tools are used to make changes.

*   **`replace_symbol_body`**: Replaces the entire body of a specific symbol (e.g., a function). This is a precise, semantic way to refactor a function's implementation.
*   **`insert_after_symbol` / `insert_before_symbol`**: Inserts new code before or after a specific symbol. Ideal for adding new functions, methods, or properties in a semantically correct location.
*   **`replace_regex`**: Replaces text using a regular expression. This is more powerful but less safe than symbolic replacement. It should be used when symbolic tools are not suitable, for example, when modifying comments, strings, or large, complex blocks of code. **Wildcards (`.*?`) should be used to keep the regex concise.**
*   **`create_text_file`**: Creates a new file with specified content.

#### 3. System Interaction & Verification

*   **`execute_shell_command`**: Executes a shell command (e.g., `npm run test`, `pnpm lint`). This is critical for verifying changes, running tests, and performing build steps.

#### 4. Metacognition & Planning

These tools are for self-reflection and ensuring the task stays on track.

*   **`think_about_collected_information`**: Should be called after a sequence of search/read operations to pause and analyze the gathered information before proceeding.
*   **`think_about_task_adherence`**: Used to ensure the current plan is still aligned with the user's original request, especially in long conversations.
*   **`think_about_whether_you_are_done`**: Called when the task seems complete, to perform a final check before confirming with the user.

#### 5. Memory Management

*   **`write_memory` / `read_memory` / `list_memories`**: Used to persist and retrieve information across sessions, building a long-term understanding of the project and user preferences.

---
