# Mass Update API - Pagination Guide

## Overview
The mass update API now supports pagination to handle large product catalogs efficiently. This is particularly important for stores with thousands of products.

## API Endpoints

### GET /api/admin/inventory/mass-update
Fetches products with their inventory levels across all locations.

#### Query Parameters
- `page` (number, optional): Page number, starting from 0. Default: 0
- `pageSize` (number, optional): Number of items per page. Default: 0 (no pagination)
- `search` (string, optional): Search products by name, baseName, or variant
- `category` (string, optional): Filter by category. Default: "all"

#### Response Format
```typescript
{
  products: MassUpdateProduct[];
  locations: MassUpdateLocation[];
  totalProducts: number;
  totalChanges: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }
}
```

## Usage Examples

### Fetch All Products (No Pagination)
```typescript
// Backward compatible - returns all products
const response = await fetch('/api/admin/inventory/mass-update');
const data = await response.json();
// data.pagination will be undefined
```

### Fetch First Page
```typescript
const response = await fetch('/api/admin/inventory/mass-update?page=0&pageSize=50');
const data = await response.json();

console.log(`Showing ${data.products.length} of ${data.pagination.totalItems} products`);
console.log(`Page ${data.pagination.page + 1} of ${data.pagination.totalPages}`);
```

### Fetch with Search and Pagination
```typescript
const response = await fetch('/api/admin/inventory/mass-update?search=widget&page=0&pageSize=20');
const data = await response.json();
```

### React Hook Example
```typescript
function usePaginatedMassUpdate(pageSize = 50) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data, isLoading, error } = useSWR(
    `/api/admin/inventory/mass-update?page=${page}&pageSize=${pageSize}&search=${search}&category=${category}`,
    fetcher
  );

  return {
    products: data?.products || [],
    locations: data?.locations || [],
    pagination: data?.pagination,
    isLoading,
    error,
    // Navigation helpers
    nextPage: () => {
      if (data?.pagination?.hasNext) {
        setPage(p => p + 1);
      }
    },
    prevPage: () => {
      if (data?.pagination?.hasPrevious) {
        setPage(p => p - 1);
      }
    },
    goToPage: (newPage: number) => setPage(newPage),
    setSearch,
    setCategory,
  };
}
```

## Performance Considerations

1. **Default Behavior**: When no pagination parameters are provided, all products are returned (backward compatible).

2. **Recommended Page Size**: 
   - For initial load: 50-100 products
   - For subsequent pages: 50 products
   - Maximum recommended: 200 products per page

3. **Database Optimization**: The API uses Prisma's `skip` and `take` for efficient pagination and only counts total items when pagination is enabled.

4. **Client-Side Caching**: Consider using SWR or React Query to cache paginated results and reduce server load.

## Migration Guide

Existing implementations will continue to work without changes. To enable pagination:

1. Add `page` and `pageSize` query parameters to your API calls
2. Update your UI to handle the `pagination` object in the response
3. Add navigation controls (next/previous/page numbers)
4. Consider implementing infinite scroll for better UX

## Testing

Use the provided test script to verify pagination:
```bash
export ADMIN_SESSION_TOKEN=your-session-token
node scripts/test-mass-update-pagination.js
```