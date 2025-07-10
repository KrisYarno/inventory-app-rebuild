# External Orders API

This directory contains API endpoints for managing external orders that need to be packed and fulfilled from inventory.

## Endpoints

### 1. GET /api/orders/external
List all processing orders that haven't been packed.

**Query Parameters:**
- `locationId` (optional): Filter orders by location ID

**Response:**
```json
{
  "orders": [
    {
      "id": "1",
      "externalOrderId": "ORD-001",
      "customerName": "John Doe",
      "status": "PROCESSING",
      "orderDate": "2025-01-08T00:00:00.000Z",
      "itemCount": 2,
      "unmappedItemCount": 0,
      "lockedBy": 123,  // Optional: User ID if locked
      "lockedUntil": "2025-01-09T10:30:00.000Z"  // Optional: Lock expiry
    }
  ],
  "total": 1
}
```

### 2. GET /api/orders/external/[id]
Get a single order with all items and product mapping status.

**Response:**
```json
{
  "id": "1",
  "externalOrderId": "ORD-001",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St, City, State 12345",
  "status": "PROCESSING",
  "orderDate": "2025-01-08T00:00:00.000Z",
  "items": [
    {
      "id": "1",
      "orderId": "1",
      "externalProductId": "EXT-001",
      "productId": 1,
      "quantity": 2,
      "productName": "Sample Product 1",
      "sku": "SKU001",
      "mappedProduct": {
        "id": 1,
        "name": "Sample Product 1",
        "baseName": "Sample Product",
        "variant": "Size 1"
      },
      "isMapped": true
    }
  ],
  "itemCount": 2,
  "lock": {  // Optional
    "orderId": "1",
    "userId": 123,
    "lockedAt": "2025-01-09T10:15:00.000Z",
    "expiresAt": "2025-01-09T10:30:00.000Z"
  }
}
```

### 3. POST /api/orders/external/[id]/lock
Create an order lock for the current user. Prevents other users from packing the same order.

**Headers Required:**
- `x-csrf-token`: Valid CSRF token

**Response (Success):**
```json
{
  "message": "Order locked successfully",
  "lock": {
    "orderId": "1",
    "userId": 123,
    "lockedAt": "2025-01-09T10:15:00.000Z",
    "expiresAt": "2025-01-09T10:30:00.000Z"
  }
}
```

**Response (409 Conflict):**
```json
{
  "error": "Order is already locked by another user",
  "lockedBy": 456,
  "expiresAt": "2025-01-09T10:25:00.000Z"
}
```

### 4. DELETE /api/orders/external/[id]/lock
Remove order lock if owned by current user.

**Headers Required:**
- `x-csrf-token`: Valid CSRF token

**Response:**
```json
{
  "message": "Lock removed successfully"
}
```

### 5. POST /api/orders/external/[id]/pack
Mark order as packed and create inventory deductions.

**Headers Required:**
- `x-csrf-token`: Valid CSRF token

**Request Body:**
```json
{
  "locationId": 1,
  "items": [
    {
      "orderItemId": "1",
      "productId": 1,
      "quantity": 2
    },
    {
      "orderItemId": "2",
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Order packed successfully",
  "order": {
    "id": "1",
    "externalOrderId": "ORD-001",
    "status": "PACKED",
    "packedAt": "2025-01-09T10:20:00.000Z",
    "packedBy": 123
  },
  "adjustments": [
    {
      "logId": 456,
      "productId": 1,
      "delta": -2,
      "newVersion": 5
    }
  ]
}
```

**Response (400 Bad Request - Insufficient Stock):**
```json
{
  "error": "Insufficient stock for product: Sample Product 1",
  "details": [
    {
      "productId": 1,
      "requested": 2,
      "available": 1,
      "shortfall": 1
    }
  ]
}
```

## Authentication

All endpoints require session authentication via NextAuth. Unauthenticated requests will receive a 401 response.

## CSRF Protection

POST and DELETE endpoints require a valid CSRF token in the `x-csrf-token` header. Invalid or missing tokens will receive a 403 response.

## Order Locking

- Orders must be locked before packing to prevent concurrent updates
- Locks expire after 15 minutes
- Only the user who created the lock can pack the order or remove the lock
- Locks are automatically cleared after successful packing

## Error Handling

All endpoints follow standard HTTP status codes:
- 200: Success
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (CSRF validation failed or lock owned by another user)
- 404: Not Found
- 409: Conflict (order already locked)
- 500: Internal Server Error

## Notes

Currently using mock data for orders and order items. In production, these would be:
1. Synced from an external e-commerce platform
2. Stored in database tables (ExternalOrder, ExternalOrderItem, OrderLock)
3. Include proper foreign key relationships and indexes