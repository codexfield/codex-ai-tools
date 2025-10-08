# Contributing to Codex AI Tools

Thank you for your interest in contributing! This guide will help you through the process.

## 🚀 Quick Start

1. Fork the repository
2. Create a new branch: `git checkout -b tool/your-tool-name`
3. Add your tool under `/tools/your-tool-name/`
4. Create and fill out `manifest.json`
5. Submit a PR with preview link

## 📁 Project Structure

```
tools/
  your-tool-name/
    manifest.json    # Required: Tool metadata
    README.md       # Required: Usage & setup
    src/           # Your source code
    public/        # Static assets
    dist/          # Built files (generated)
```

## 📝 Manifest Requirements

Each tool needs a `manifest.json`:

```json
{
  "name": "Your Tool Name",
  "slug": "your-tool-name",
  "description": "A short description",
  "author": {
    "name": "Your Name",
    "github": "@username"
  },
  "demoPath": "tools/your-tool-name/dist",
  "framework": "vanilla|react|svelte|etc",
  "entry": "index.html",
  "tags": ["ai", "game", "etc"],
  "license": "MIT",
  "previewImage": "screenshot.png",
  "requiresServer": false
}
```

## 🔑 API Keys & Security

- Never commit API keys or secrets
- Use environment variables
- Document key requirements
- Consider using backend proxies

## 🎨 Code Style

- Use consistent naming
- Format with Prettier
- Follow ESLint rules
- Document public APIs

## 📋 PR Checklist

Before submitting:

- [ ] Added `manifest.json`
- [ ] Included README
- [ ] Added preview screenshot
- [ ] Builds successfully
- [ ] Preview link works
- [ ] Follows style guide
- [ ] No API keys exposed

## 🚀 Development Workflow

1. **Setup**
   ```bash
   cd tools/your-tool-name
   npm install
   npm start
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Test Preview**
   ```bash
   # Preview will be available in PR
   ```

## 📝 Commit Messages

Format: `type(scope): message`

Examples:
- `feat(tool): add new AI game`
- `fix(docs): update README`
- `chore(deps): update dependencies`

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.