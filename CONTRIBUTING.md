# Contributing to RateThisRepo

Thank you for your interest in contributing to RateThisRepo! This document provides guidelines and workflow information to help you contribute effectively.

## Development Workflow

### Branching Strategy

We follow a simplified Git Flow branching strategy:

- **`main` branch**: Holds the latest stable, released code. This branch should always be in a production-ready state.
  
- **`develop` branch**: Used for integrating new features and fixes that are ready for the next release. All pull requests should target this branch.
  
- **`feature/*` branches**: Used for developing new features or enhancements. Create these branches from `develop` and merge back to `develop` when complete.
  
- **`bugfix/*` branches**: Used for fixing bugs. Create these branches from `develop` and merge back to `develop` when complete.
  
- **`release/*` branches**: Created from `develop` when preparing a new release. Final fixes and version bumps happen here before merging to both `main` and `develop`.

### Pull Request Process

1. Create a new branch from `develop` with a descriptive name (e.g., `feature/add-dark-theme` or `bugfix/fix-analysis-panel-style`).

2. Make your changes, following the coding standards and testing guidelines.

3. Submit a pull request to the `develop` branch.

4. Ensure your PR includes:
   - A clear description of the changes
   - Any necessary documentation updates
   - Test coverage for new functionality
   - No lint errors or warnings

5. Once reviewed and approved, your changes will be merged into `develop`.

## Coding Standards

- Follow the TypeScript coding style in the existing codebase
- Keep files under 300 lines where possible
- Use meaningful names for variables, functions, and classes
- Add JSDoc comments for public functions and interfaces
- Follow the component patterns established in the codebase

## Testing

- Write unit tests for new functionality
- Run existing tests before submitting a PR: `pnpm test`
- Ensure your changes don't break existing tests

## Commit Guidelines

We follow a simplified version of the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect the meaning of the code (formatting, etc.)
- `refactor:` - Code changes that neither fix a bug nor add a feature
- `test:` - Adding or fixing tests
- `chore:` - Changes to the build process or auxiliary tools

Example commit message:
```
feat: add repository star count to analysis panel

Added functionality to display the repository star count in the analysis panel.
This provides users with an immediate indicator of repository popularity.
```

## Release Process

Releases are handled by the project maintainers following this process:

1. Integration of features and fixes into `develop`
2. Creation of a `release/x.y.z` branch from `develop`
3. Version number updates and final fixes in the release branch
4. Merge to `main` and tag with version number (from the main branch)
5. Merge back to `develop` to incorporate any release fixes

<details>
<summary><strong>Detailed Release Commands</strong> (click to expand)</summary>

```bash
# 1. Create a release branch from develop
git checkout develop
git pull
git checkout -b release/x.y.z

# 2. Update version numbers
pnpm run version:minor  # or :patch or :major as appropriate
# Make any final tweaks and fixes
git commit -m "chore: prepare for x.y.z release"

# 3. Merge to main after testing
git checkout main
git merge release/x.y.z

# 4. Create a version tag from the main branch
git tag -a vx.y.z -m "Release version x.y.z"
git push origin main --tags

# 5. Merge back to develop
git checkout develop
git merge release/x.y.z
git push origin develop
```
</details>

## Questions?

If you have any questions or need help, please open an issue for discussion.
