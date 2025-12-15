# Contributing to Servarr Control Hub

Thank you for your interest in contributing to Servarr Control Hub! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported in [Issues](https://github.com/Qballjos/Homey-Servarr/issues)
2. Check the [README](README.md) and [INSTALLATION](INSTALLATION.md) for common solutions

When creating a bug report, use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Homey version, firmware, app version)
- Relevant logs

### Suggesting Enhancements

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) to suggest new features or improvements. Include:
- Clear description of the feature
- Use case and problem it solves
- Proposed solution
- Priority level

### Pull Requests

1. **Fork the repository** and create a new branch from `master`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**
   - Test on Homey Pro Mini if possible
   - Test with different Servarr configurations
   - Verify Flow Cards and Widgets work correctly

4. **Commit your changes**
   - Write clear, descriptive commit messages
   - Reference related issues if applicable

5. **Push and create Pull Request**
   - Push your branch to your fork
   - Create a Pull Request using the template
   - Provide a clear description of changes

## Development Setup

### Prerequisites
- Node.js installed
- Homey CLI installed (`npm install -g homey`)
- Access to a Homey device for testing

### Setup Steps

1. Clone the repository
   ```bash
   git clone https://github.com/Qballjos/Homey-Servarr.git
   cd Homey-Servarr
   ```

2. Install dependencies (if any)
   ```bash
   npm install
   ```

3. Connect to your Homey
   ```bash
   homey login
   ```

4. Run the app
   ```bash
   homey app run
   ```

## Code Style Guidelines

- Use ES6+ JavaScript features
- Follow existing code structure and patterns
- Add JSDoc comments for functions and classes
- Keep functions focused and single-purpose
- Use meaningful variable and function names
- Handle errors gracefully with try-catch blocks

## Project Structure

```
Homey Servarr/
├── app.js                 # App entry point
├── app.json               # App manifest
├── drivers/               # Device drivers
│   └── servarr_hub/
│       ├── driver.js      # Driver implementation
│       ├── device.js      # Device implementation
│       ├── pair/          # Pairing views
│       └── widgets/        # Dashboard widgets
├── lib/                   # Library code
│   ├── ServarrAPI.js     # API client
│   └── flow/              # Flow card implementations
└── locales/               # Translations
```

## Testing Guidelines

When testing changes:
- Test with at least one Servarr app enabled
- Test Flow Cards (triggers and actions)
- Test Widgets on dashboard
- Test error scenarios (invalid API keys, network issues)
- Verify polling works correctly
- Check logs for errors

## Documentation

- Update README.md for user-facing changes
- Update INSTALLATION.md for setup changes
- Update CHANGELOG.md for significant changes
- Add code comments for complex logic

## Questions?

- Check existing [Issues](https://github.com/Qballjos/Homey-Servarr/issues)
- Start a [Discussion](https://github.com/Qballjos/Homey-Servarr/discussions)
- Review the [README](README.md) and documentation

Thank you for contributing! 🎉



