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

### Complete Release Process

#### Regular Development Phase

1. **Feature/bugfix development:**
   - Create feature/bugfix branches from `develop`
   - Complete development work
   - Open PRs to merge into `develop`
   - After review, merge these branches into `develop`
   - This continues until `develop` contains all the features and fixes planned for the next release

#### Release Preparation Phase

2. **Create release branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/x.y.z    # Example: release/1.2.0
   ```

3. **Final testing and release-specific fixes:**
   - Test the release candidate thoroughly
   - For minor release-specific fixes, commit directly to the release branch:
     ```bash
     git add .
     git commit -m "fix: final adjustments for release x.y.z"
     ```
   
   - For more complex fixes during release testing:
     ```bash
     # Create a bugfix branch from the release branch
     git checkout -b bugfix/release-issue release/x.y.z
     
     # Fix the issue
     git add .
     git commit -m "fix: address release issue"
     
     # Create PR to merge back into the release branch
     git push -u origin bugfix/release-issue
     # Then create PR on GitHub to merge into release/x.y.z
     ```

4. **Prepare release branch for merge:**
   - Ensure all release-specific fixes are complete
   - Update changelogs, documentation, etc.
   - Push the release branch:
     ```bash
     git push -u origin release/x.y.z
     ```

5. **Create PR for release:**
   - Create a PR on GitHub from `release/x.y.z` to `main`
   - Request code reviews
   - Conduct final testing
   - After approval, merge to `main` via GitHub UI

#### Release Finalization Phase

6. **Create version and tag on main:**
   ```bash
   git checkout main
   git pull origin main
   pnpm version minor  # or patch/major as appropriate
   ```
   - This automatically creates a commit AND an annotated tag (e.g., v1.2.0)
   - The tag is created directly on the main branch

7. **Push main with the new tag:**
   ```bash
   git push --follow-tags
   ```

8. **Create a GitHub Release:**
   - Go to the repository on GitHub -> Releases -> Draft a new release
   - Choose the tag you just pushed (e.g., `v1.2.0`)
   - Fill in the release title and description
   - Publish the release

#### Post-Release Phase

9. **Merge changes back into develop:**
   ```bash
   git checkout develop
   git pull origin develop
   git merge --no-ff main  # Use --no-ff to keep release history clear
   git push origin develop
   ```

10. **Clean up:**
    ```bash
    git branch -d release/x.y.z  # Delete local branch
    git push origin --delete release/x.y.z  # Delete remote branch
    ```

<details>
<summary><strong>Complete Release Process Example</strong> (click to expand)</summary>

```bash
# --- REGULAR DEVELOPMENT PHASE ---

# Feature development (repeat for each feature)
git checkout develop
git pull origin develop
git checkout -b feature/new-feature
# ... work on feature ...
git add .
git commit -m "feat: implement new feature"
git push -u origin feature/new-feature
# Create PR, get reviews, and merge to develop

# Bugfix development (repeat for each bug)
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-issue
# ... fix bug ...
git add .
git commit -m "fix: resolve specific issue"
git push -u origin bugfix/fix-issue
# Create PR, get reviews, and merge to develop

# --- RELEASE PREPARATION PHASE ---

# Create release branch when develop contains all planned features/fixes
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Testing and release-specific fixes
# (For minor fixes, commit directly to release branch)
git add .
git commit -m "fix: address feedback from release testing"

# (For complex fixes, create bugfix branch from release)
git checkout -b bugfix/complex-release-issue release/1.2.0
# ... implement fix ...
git add .
git commit -m "fix: resolve complex issue for release"
git push -u origin bugfix/complex-release-issue
# Create PR to merge back to release/1.2.0

# Push release branch and create PR to main
git checkout release/1.2.0
git pull origin release/1.2.0  # In case bugfix PRs were merged
git push -u origin release/1.2.0
# Create PR from release/1.2.0 to main

# --- RELEASE FINALIZATION PHASE ---

# After PR is approved and merged to main via GitHub UI
git checkout main
git pull origin main

# Version bump and tag creation
pnpm version minor
git push --follow-tags

# --- POST-RELEASE PHASE ---

# Merge changes back to develop
git checkout develop
git pull origin develop
git merge --no-ff main
git push origin develop

# Cleanup
git branch -d release/1.2.0
git push origin --delete release/1.2.0
```
</details>

## Questions?

If you have any questions or need help, please open an issue for discussion.