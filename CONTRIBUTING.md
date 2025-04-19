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

1. Create a new branch from `develop` with a descriptive name (e.g., `feature/add-dark-theme` or `bugfix/fix-analysis-panel-style`):
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following the coding standards and testing guidelines.

3. Commit your changes with appropriate messages:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. Push your branch to GitHub:
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create a Pull Request on GitHub**:
   - Navigate to the repository on GitHub.com
   - Click on "Pull Requests" tab
   - Click the green "New pull request" button
   - Set the "base" branch to `develop`
   - Set the "compare" branch to your feature branch
   - Click "Create pull request"
   - Fill out the PR template with a clear description of your changes

6. Ensure your PR includes:
   - A clear description of the changes
   - Any necessary documentation updates
   - Test coverage for new functionality
   - No lint errors or warnings

7. Request reviews from team members.

8. Once reviewed and approved, your changes will be merged into `develop`.

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

### Version Numbering (Semantic Versioning)

We follow [Semantic Versioning](https://semver.org/) principles for version numbers:

- **x.y.z** format where:
  - **x** = Major version (incremented for incompatible API changes)
  - **y** = Minor version (incremented for backward-compatible new features)
  - **z** = Patch version (incremented for backward-compatible bug fixes)

For example, version 2.3.1 means:
- 2 = Major version
- 3 = Minor version
- 1 = Patch version

### Process Steps

1. Integration of features and fixes into `develop`.

2. Creation of a `release/x.y.z` branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b release/x.y.z    # Example: release/1.2.0
   ```

3. Version number updates and final fixes in the release branch:
   ```bash
   pnpm run version:minor  # or :patch or :major as appropriate
   # Make any final tweaks and fixes
   git add .
   git commit -m "chore: prepare for x.y.z release"
   ```

4. Push the release branch to GitHub and create a PR:
   ```bash
   git push -u origin release/x.y.z
   ```
   - Create a PR on GitHub from `release/x.y.z` to `main`
   - Request code reviews
   - Conduct final testing

5. After PR approval, merge to `main`:
   ```bash
   git checkout main
   git pull
   git merge release/x.y.z
   ```

6. **Create a version tag** from the main branch:
   ```bash
   git tag -a vx.y.z -m "Release version x.y.z"
   git push origin main --tags
   ```

7. Create a GitHub Release:
   - Go to the repository on GitHub
   - Click on "Releases"
   - Click "Draft a new release"
   - Choose the tag you just created
   - Fill in the release title and description
   - Add release notes detailing the changes
   - Click "Publish release"

8. Merge back to `develop` to incorporate any release fixes:
   ```bash
   git checkout develop
   git pull
   git merge release/x.y.z
   git push origin develop
   ```

<details>
<summary><strong>Complete Release Process Example</strong> (click to expand)</summary>

```bash
# Starting a new release
git checkout develop
git pull
git checkout -b release/x.y.z    # e.g., release/1.2.0

# Update version numbers
pnpm run version:minor  # or :patch or :major depending on the nature of the changes
# Make any final tweaks and fixes
git add .
git commit -m "chore: prepare for x.y.z release"

# Push release branch and create PR on GitHub
git push -u origin release/x.y.z
# Go to GitHub and create PR from release/x.y.z to main
# After PR is approved and merged...

# Merge to main after PR approval
git checkout main
git pull
# The PR merge has already incorporated changes, but this ensures we're up to date

# Create a version tag from the main branch
git tag -a vx.y.z -m "Release version x.y.z"    # e.g., v1.2.0
git push origin main --tags

# Go to GitHub, create a Release from this tag

# Merge back to develop
git checkout develop
git pull
git merge main # or merge the release branch directly
git push origin develop
```
</details>

## Questions?

If you have any questions or need help, please open an issue for discussion.