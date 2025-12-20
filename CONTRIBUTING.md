# Contributing to emoji-to-icons

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Improving Mappings](#improving-mappings)

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](README.md).

Before you ask a question, it is best to search for existing [Issues](https://github.com/huikku/emoji-to-icons/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

## I Want To Contribute

### Improving Mappings

This is the most common way to contribute! If you see an emoji mapping that is missing, incorrect, or could be better:

1.  **Use the Validator**: We have built a dedicated tool to visualize and verify mappings.
    *   **[Open the Validator](https://huikku.github.io/emoji-to-icons/)**
    *   Use the search or filter to find the emoji.
    *   Use the controls to find a better icon candidate.
    *   Click the **"Report"** button in the validator to generate a JSON report of your proposed changes.

2.  **Submit a PR**:
    *   Fork this repository.
    *   Edit the relevant file in `src/mappings/` (e.g., `src/mappings/lucide.ts`).
    *   Update the mapping with your improved icon name.
    *   Run tests: `npm test`.
    *   Push your changes and open a Pull Request.
    *   Paste your Validator Report in the PR description if applicable!

### Style Guide

*   **TypeScript**: We use TypeScript for everything. Please ensure your code works with the type definitions.
*   **Formatting**: We use Prettier. Run `npm run format` before committing.
*   **Linting**: Run `npm run lint` to ensure your code matches our standards.

## Development Setup

1.  Clone the repo:
    ```bash
    git clone https://github.com/huikku/emoji-to-icons.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run build:
    ```bash
    npm run build
    ```
4.  Run the Validator locally:
    ```bash
    npm run dev
    ```

Thanks! 🚀
