# Products Data Normalization Reference

Quick reference for how backend MongoDB data is normalized to frontend format.

## Field Mappings

### Core Fields
| Backend Field | Frontend Field | Fallback/Default |
|--------------|----------------|------------------|
| `_id` | `id` | `product.id` |
| `title` | `name` | `product.name` or `"Unnamed Product"` |
| `basePrice` | `price` | `normalized.price` or `0` |
| `variants[0].inventory` | `stock` | `normalized.stock` or `0` |
| `__v` | _(removed)_ | N/A |

### Category Normalization
```javascript
// Backend: categoryId (object or string)
{
  _id: "68eac55d1b85de02e787a485",
  name: "Electronics"
}

// Frontend: category (object)
{
  id: "68eac55d1b85de02e787a485",
  name: "Electronics"
}

// If null/missing:
{
  id: "",
  name: "Uncategorized"
}
```

### Vendor Normalization
```javascript
// Backend: vendorId (object, string, or null)
{
  _id: "vendor123",
  businessName: "Tech Store"
}

// Frontend: vendor (object)
{
  id: "vendor123",
  businessName: "Tech Store"
}

// If null/missing:
{
  id: "",
  businessName: "No Vendor"
}
```

### Images Normalization
```javascript
// Backend: images (array of objects or strings)
[
  {
    url: "https://...",
    _id: "img123"
  }
]

// Frontend: images (array with isPrimary and alt)
[
  {
    url: "https://...",
    isPrimary: true,  // First image is primary
    alt: "Product Name"
  }
]

// If missing/empty:
[]  // Empty array
```

## Response Structure Handling

### Structure 1: Standard (Expected)
```json
{
  "data": [
    { "id": "1", "name": "Product 1" },
    { "id": "2", "name": "Product 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```
**Action**: Use as-is after normalizing products

### Structure 2: Direct Array
```json
[
  { "_id": "1", "title": "Product 1" },
  { "_id": "2", "title": "Product 2" }
]
```
**Action**: Wrap in { data: [], meta: {} } structure

### Structure 3: Alternative Structure
```json
{
  "products": [
    { "_id": "1", "title": "Product 1" }
  ],
  "meta": { ... }
}
```
**Action**: Extract products array and normalize

## Normalization Flow

```
Backend Response
       ↓
1. Detect Structure
       ↓
2. Extract Products Array
       ↓
3. For Each Product:
   - Convert _id → id
   - Convert title → name
   - Normalize categoryId → category
   - Normalize vendorId → vendor
   - Normalize images array
   - Set default values
   - Remove MongoDB fields
       ↓
4. Return Normalized Response
```

## Required Fields Defaults

| Field | Default Value | Notes |
|-------|---------------|-------|
| `name` | `"Unnamed Product"` | From title or name |
| `sku` | `"N/A"` | If missing |
| `price` | `0` | From price or basePrice |
| `stock` | `0` | From stock or variants[0].inventory |
| `slug` | `product.id` | If missing |
| `description` | `""` | Empty string |
| `approvalStatus` | `"pending"` | If missing |
| `images` | `[]` | Empty array |
| `category` | `{ id: "", name: "Uncategorized" }` | If null |
| `vendor` | `{ id: "", name: "No Vendor" }` | If null |

## Example Transformation

### Input (Backend MongoDB)
```json
{
  "_id": "68ed4ee1a259015053b8ad3a",
  "title": "Smartphone",
  "basePrice": 1000,
  "categoryId": {
    "_id": "cat123",
    "name": "Electronics"
  },
  "vendorId": null,
  "images": ["https://example.com/img.jpg"],
  "variants": [
    { "inventory": 20, "sku": "SKU123" }
  ],
  "__v": 0
}
```

### Output (Frontend Normalized)
```json
{
  "id": "68ed4ee1a259015053b8ad3a",
  "name": "Smartphone",
  "price": 1000,
  "stock": 20,
  "sku": "N/A",
  "category": {
    "id": "cat123",
    "name": "Electronics"
  },
  "vendor": {
    "id": "",
    "businessName": "No Vendor"
  },
  "images": [
    {
      "url": "https://example.com/img.jpg",
      "isPrimary": true,
      "alt": "Smartphone"
    }
  ],
  "slug": "68ed4ee1a259015053b8ad3a",
  "description": "",
  "approvalStatus": "pending"
}
```

## Common Issues & Solutions

### Issue: Product has no name
**Cause**: Backend uses `title` instead of `name`
**Solution**: Normalization uses `title` as fallback
```javascript
name: product.name || title || "Unnamed Product"
```

### Issue: Missing vendor information
**Cause**: `vendorId` is null
**Solution**: Set default vendor object
```javascript
vendor: { id: "", businessName: "No Vendor" }
```

### Issue: Stock is 0 but variants have inventory
**Cause**: `stock` field not populated
**Solution**: Use variant inventory as fallback
```javascript
stock: normalized.stock || variants?.[0]?.inventory || 0
```

### Issue: Images not displaying
**Cause**: Missing `isPrimary` flag
**Solution**: Set first image as primary
```javascript
isPrimary: imgRest.isPrimary ?? (index === 0)
```

### Issue: Category shows as undefined
**Cause**: `categoryId` is object but not normalized
**Solution**: Extract and normalize categoryId
```javascript
category: {
  id: categoryId._id || categoryId.id,
  name: categoryId.name || "Unknown"
}
```

## Testing Checklist

- [ ] Products with `_id` convert to `id`
- [ ] Products with `title` show as `name`
- [ ] Products with `basePrice` show correct price
- [ ] Products with variant inventory show correct stock
- [ ] Products with null vendor show "No Vendor"
- [ ] Products with null category show "Uncategorized"
- [ ] First image has `isPrimary: true`
- [ ] Images without alt use product name
- [ ] All MongoDB fields (`__v`, `_id`) are removed
- [ ] Missing required fields have defaults

## Maintenance

When backend structure changes:
1. Add new field mapping in `normalizeProduct()`
2. Update this reference document
3. Add default values for new required fields
4. Test with actual backend data

## Code Location

**File**: `src/lib/api/services/products.service.ts`
**Function**: `normalizeProduct()`
**Lines**: ~45-120

---

**Last Updated**: 2025-10-13
**Version**: 1.0
