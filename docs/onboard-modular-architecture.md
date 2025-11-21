# Onboarding a New Modular Architecture Module

This guide outlines the steps to create and onboard a new modular architecture module into the ODH Dashboard.

## Prerequisites

- Node.js and npm installed.
- Access to the ODH Dashboard repository.

## Steps

### 1. Navigate to the Packages Directory

Open your terminal and navigate to the `packages` folder within the repository:

```bash
cd packages
```

### 2. Initialize the Module

Start a new modular architecture project using the installer. Replace `<your-module-name>` with the desired name for your module.

```bash
npx mod-arch-installer <your-module-name> --flavor default
```

### 3. Adapt the Module Name

After initialization, you need to update the generated code to match your specific module name. Search for occurrences of `mod-arch` and `modArch` in your new package and replace them with your module's identifier.

Key files to check:

- `package.json`
- `frontend/src/odh/extensions.ts` (or similar entry point)
- `Makefile`

### 4. Configure the Port

By default, the modular architecture component runs on port `9103`. If you need to use a different port or want to ensure it doesn't conflict with other modules:

1. **Update `Makefile`**:
   Open `packages/<your-module-name>/Makefile` and find the `dev-frontend-federated` target. Update the `PORT` variable:

   ```makefile
   dev-frontend-federated:
       cd frontend && AUTH_METHOD=user_token DEPLOYMENT_MODE=federated STYLE_THEME=patternfly PORT=<your-port> npm run start:dev
   ```

2. **Update `package.json`**:
   Open `packages/<your-module-name>/package.json` and update the `module-federation` configuration:

   ```json
   "module-federation": {
     "local": {
       "port": <your-port>
     }
   }
   ```

### 5. Add Feature Flag

To enable your module in the main dashboard, you need to add a feature flag.

1. Open `frontend/src/concepts/areas/const.ts` in the root of the repository.
2. Search for existing flags (e.g., search for `disable` or `techPreviewFlags`).
3. Add your new feature flag to the appropriate group (e.g., `techPreviewFlags`):

   ```typescript
   export const techPreviewFlags = {
     // ... existing flags
     // yourModuleName: true, // Set to true to enable by default in tech preview, or false otherwise
   } satisfies Partial<DashboardCommonConfig>;
   ```

### 6. Run the Application

Now that your project is configured, you can run the entire stack (backend, frontend, and your new module).

From the root of the repository, run:

```bash
npm run dev:frontend
```

And in other terminal

```bash
npm run dev:backend
```

And once you have that in another terminal run

```bash
cd packages/<your-module>
make dev-start-federated
```

This command will start:

- The Dashboard Backend
- The Dashboard Frontend (Shell)
- Your new Modular Architecture Module (Federated)

Access the dashboard in your browser (usually at `http://localhost:4000` or the port configured for the shell) and verify that your module is loaded.

### 7. Migrate from Shared Dependencies to Dashboard Module Imports

Once your application is working correctly, you should migrate away from using local `shared` folder dependencies and instead import components directly from the main dashboard module.

**Why?**

- Ensures consistency with the main dashboard codebase
- Reduces code duplication
- Keeps your module in sync with dashboard updates
- Follows the modular architecture best practices

**How to migrate:**

1. **Identify shared imports**: Search for imports from local `shared` folders or relative paths to dashboard components.

2. **Update imports to use `@odh-dashboard/internal`**: Replace shared folder imports with the internal dashboard module path.

3. **Common components to migrate:**
   - `ApplicationsPage` → `@odh-dashboard/internal/pages/ApplicationsPage`
   - React context providers and hooks
   - Utility functions
   - Shared UI components

4. **Verify the migration**: After updating imports, run your module and ensure all functionality works as expected:

   ```bash
   cd packages/<your-module>
   make dev-start-federated
   ```

5. **Remove unused shared code**: Once all imports are migrated, you can safely remove any local `shared` folder copies that are no longer needed.
