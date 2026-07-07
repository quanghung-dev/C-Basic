# Product Name Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `GET /api/products?search=...` perform a case-insensitive partial match on product names.

**Architecture:** Keep search on the products collection endpoint and compose an EF Core query before materialization. Remove the unused path-based name endpoint and keep the frontend request contract unchanged, while correcting its placeholder copy.

**Tech Stack:** ASP.NET Core 10, EF Core 10, Npgsql, xUnit, EF Core InMemory, React 19, Vite 8

## Global Constraints

- Search only `Product.Name`, not `Category`.
- Trim search text before matching.
- Empty or whitespace-only search returns all products.
- Matching is partial and case-insensitive.

---

### Task 1: Add controller search regression tests

**Files:**
- Create: `Backend.Tests/ProductManagementApi.Tests.csproj`
- Create: `Backend.Tests/ProductsControllerTests.cs`
- Test: `Backend.Tests/ProductsControllerTests.cs`

**Interfaces:**
- Consumes: `ProductsController.GetAll(string? search)` (desired controller contract)
- Produces: Regression coverage for partial, case-insensitive, and blank search

- [ ] **Step 1: Create the test project and failing controller tests**

Create an xUnit project referencing `Backend/ProductManagementApi.csproj`, `Microsoft.EntityFrameworkCore.InMemory` 10.0.9, and `Microsoft.NET.Test.Sdk` 18.0.1. Add three tests that seed `Keychron K8` and `Logitech MX Master 3S`, call `GetAll("keyCHRON")`, `GetAll("  MX Master  ")`, and `GetAll("   ")`, then assert the returned `OkObjectResult` contains respectively one, one, and both products.

- [ ] **Step 2: Run tests and verify RED**

Run: `dotnet test Backend.Tests/ProductManagementApi.Tests.csproj`

Expected: compilation fails because the current `GetAll()` method does not accept a search argument.

- [ ] **Step 3: Do not change production code in this task**

The failing compilation is the regression proof required before implementation.

### Task 2: Implement collection search

**Files:**
- Modify: `Backend/Controllers/ProductsController.cs`
- Test: `Backend.Tests/ProductsControllerTests.cs`

**Interfaces:**
- Consumes: optional query string `search`
- Produces: `Task<IActionResult> GetAll(string? search)` returning a JSON array

- [ ] **Step 1: Implement minimal query filtering**

Change `GetAll` to accept `[FromQuery] string? search`, start with `_context.Products.AsQueryable()`, trim a nonblank value, and apply `EF.Functions.ILike(p.Name, $"%{term}%")`. Remove `GetByName` and its `[HttpGet("{name}")]` route.

- [ ] **Step 2: Run tests and verify GREEN**

Run: `dotnet test Backend.Tests/ProductManagementApi.Tests.csproj`

Expected: all three tests pass. If the InMemory provider cannot translate `ILike`, use PostgreSQL-backed integration testing or a provider-neutral normalized `Contains` expression while preserving the specified behavior.

- [ ] **Step 3: Build backend**

Run: `dotnet build Backend/ProductManagementApi.csproj`

Expected: build succeeds with zero errors.

### Task 3: Align frontend copy and verify the system

**Files:**
- Modify: `frontend/src/App.jsx`
- Verify: `frontend/src/services/api.js`

**Interfaces:**
- Consumes: `getProducts(search)` which sends `?search=<encoded value>`
- Produces: A search input accurately labeled as product-name search

- [ ] **Step 1: Update placeholder copy**

Replace `Search products by name or category...` with `Search products by name...`.

- [ ] **Step 2: Run frontend checks**

Run: `npm run lint` and `npm run build` from `frontend`.

Expected: both commands exit successfully.

- [ ] **Step 3: Verify the running API**

Restart the backend if needed, then request `/api/products?search=keychron`, `/api/products?search=MX%20Master`, and `/api/products?search=`. Expected counts are one, one, and all products respectively.

- [ ] **Step 4: Commit if Git becomes available**

Stage the controller, tests, frontend placeholder, spec, and plan, then commit with `fix: support product name search`. The current workspace has no `.git`, so skip this step unless repository metadata is added.
