# Product Name Search Design

## Goal

Make the frontend search bar filter products by name through the existing
`GET /api/products?search=...` request.

## API behavior

- `GET /api/products` returns every product.
- `GET /api/products?search=<text>` trims the search text and returns products
  whose names contain that text.
- Name matching is case-insensitive.
- An empty or whitespace-only search value returns every product.
- Search applies only to `Product.Name`, not `Category`.

## Backend change

Update `ProductsController.GetAll` to accept an optional `search` query
parameter and compose the filtering expression before executing the database
query. Remove the separate `GetByName` route because the collection endpoint
now owns search behavior and the frontend does not call the path-based route.

## Frontend change

Keep the existing `?search=...` request format. Update the input placeholder so
it describes name-only search accurately.

## Verification

Add controller/API tests covering partial name matching, case-insensitive
matching, and empty search. Build both backend and frontend, then probe the
running API with representative requests.
