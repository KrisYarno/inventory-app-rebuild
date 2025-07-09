# CSRF Meta Tag Implementation

## Overview
Implemented server-side CSRF token generation with meta tag injection to eliminate the need for client-side API calls to fetch CSRF tokens.

## Changes Made

### 1. Root Layout Modification (`app/layout.tsx`)
- Made the RootLayout function async
- Added server-side CSRF token generation using `getCSRFToken()`
- Injected the token as a meta tag in the HTML head:
  ```html
  <meta name="csrf-token" content={csrfToken} />
  ```

### 2. useCSRF Hook Enhancement (`hooks/use-csrf.ts`)
- Updated to check for meta tag token first using `getClientCSRFToken()`
- Falls back to API call only if meta tag is not found
- This provides backward compatibility while improving performance

## Benefits
1. **Performance**: Eliminates an extra API call on page load
2. **Immediate Availability**: CSRF token is available as soon as the page loads
3. **Server-Side Generation**: Token is generated during SSR, improving security
4. **Session Persistence**: Token persists for 24 hours (configurable)

## How It Works
1. When a user visits the app, the root layout generates or retrieves an existing CSRF token
2. The token is included as a meta tag in the HTML response
3. Client-side code can access it immediately via `getClientCSRFToken()`
4. The `useCSRF` hook checks the meta tag first before making any API calls
5. All API requests include the token in the `x-csrf-token` header

## Usage
The existing code continues to work without modification. Components using `useCSRF` hook will automatically benefit from the performance improvement.

```typescript
// Existing code works as-is
const { token, isLoading } = useCSRF();

// Direct access also available
import { getClientCSRFToken, addCSRFHeader } from '@/lib/csrf';
const token = getClientCSRFToken();
```

## Security Notes
- Token is stored in an httpOnly cookie (not accessible to JavaScript)
- Meta tag contains the same token for client-side use
- Server validates by comparing cookie token with header token
- Tokens expire after 24 hours and are regenerated automatically