# Admin App - Quick Reference Guide

Quick reference for using the newly implemented services in the DigiMall Admin Application.

---

## 📁 File Uploads Service

### Upload Single Image
```typescript
import { useUploadImage } from '@/lib/hooks/use-uploads';

function CategoryImageUpload() {
  const { mutate: uploadImage, isPending } = useUploadImage();

  const handleUpload = (file: File) => {
    uploadImage(
      { file, folder: 'categories' },
      {
        onSuccess: (data) => {
          console.log('Uploaded:', data.data.url);
          // Use data.data.url in your category form
        },
      }
    );
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

### Upload Multiple Images
```typescript
import { useUploadImages } from '@/lib/hooks/use-uploads';

function ProductGalleryUpload() {
  const { mutate: uploadImages, isPending } = useUploadImages();

  const handleUpload = (files: File[]) => {
    uploadImages(
      { files, folder: 'products' },
      {
        onSuccess: (data) => {
          const urls = data.data.map(file => file.url);
          console.log('Uploaded images:', urls);
        },
      }
    );
  };

  return <input type="file" multiple onChange={(e) => handleUpload(Array.from(e.target.files))} />;
}
```

### Upload Document
```typescript
import { useUploadDocument } from '@/lib/hooks/use-uploads';

function DocumentUpload() {
  const { mutate: uploadDoc } = useUploadDocument();

  const handleUpload = (file: File) => {
    uploadDoc(
      { file, folder: 'documents' },
      {
        onSuccess: (data) => {
          console.log('Document URL:', data.data.url);
        },
      }
    );
  };

  return <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

### Delete File
```typescript
import { useDeleteFile, useFileUtils } from '@/lib/hooks/use-uploads';

function DeleteFileButton({ fileUrl }: { fileUrl: string }) {
  const { mutate: deleteFile } = useDeleteFile();
  const { extractFileKeyFromUrl } = useFileUtils();

  const handleDelete = () => {
    const fileKey = extractFileKeyFromUrl(fileUrl);
    if (fileKey) {
      deleteFile(fileKey);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## 🎨 Landing Page Management

### Get Landing Config
```typescript
import { landingService } from '@/lib/api/services';

async function loadLandingConfig() {
  const config = await landingService.getConfig();
  console.log('Hero title:', config.data.hero.title);
}
```

### Create Banner
```typescript
import { landingService } from '@/lib/api/services';

async function createBanner() {
  const banner = await landingService.createBanner({
    title: 'Summer Sale',
    subtitle: 'Up to 50% off',
    imageUrl: 'https://cdn.example.com/banner.jpg',
    ctaText: 'Shop Now',
    ctaLink: '/products/sale',
    active: true,
    order: 1,
    targetAudience: 'all',
  });
}
```

### Update Featured Categories
```typescript
import { landingService } from '@/lib/api/services';

async function setFeaturedCategories(categoryIds: string[]) {
  await landingService.updateFeaturedCategories({ categoryIds });
}
```

---

## 📊 Reports Service

### Generate Sales Report
```typescript
import { reportsCompleteService } from '@/lib/api/services';

async function generateSalesReport() {
  const report = await reportsCompleteService.generate({
    type: 'sales',
    title: 'Q4 2025 Sales Report',
    format: 'pdf',
    parameters: {
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      includeCharts: true,
      includeDetails: true,
    },
  });

  console.log('Report ID:', report.data.id);
  console.log('Download URL:', report.data.fileUrl);
}
```

### Export Products to Excel
```typescript
import { reportsCompleteService } from '@/lib/api/services';

async function exportProducts() {
  const blob = await reportsCompleteService.exportProducts({
    format: 'excel',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  });

  const filename = reportsCompleteService.generateFilename('products', 'excel');
  reportsCompleteService.downloadReport(blob, filename);
}
```

### Schedule Monthly Report
```typescript
import { reportsCompleteService } from '@/lib/api/services';

async function scheduleMonthlySalesReport() {
  const scheduled = await reportsCompleteService.scheduleReport({
    type: 'sales',
    title: 'Monthly Sales Report',
    format: 'pdf',
    frequency: 'monthly',
    parameters: {
      period: 'month',
      includeCharts: true,
    },
    recipients: ['admin@digimall.ng', 'ceo@digimall.ng'],
    active: true,
  });

  console.log('Scheduled report ID:', scheduled.data.id);
  console.log('Next run:', scheduled.data.nextRunAt);
}
```

---

## ⚙️ Settings Service

### Get Platform Config
```typescript
import { settingsService } from '@/lib/api/services';

async function loadSettings() {
  const configs = await settingsService.getPlatformConfig('general');

  configs.forEach(config => {
    console.log(`${config.label}: ${config.value}`);
  });
}
```

### Update Config Value
```typescript
import { settingsService } from '@/lib/api/services';

async function enableBargaining() {
  await settingsService.updatePlatformConfig('features_bargaining', true);
}
```

### Get System Status
```typescript
import { settingsService } from '@/lib/api/services';

async function checkSystemHealth() {
  const status = await settingsService.getSystemStatus();

  console.log('Overall status:', status.overall);
  console.log('Services:', status.services);
  console.log('Resources:', status.resources);
}
```

---

## 🔥 Disputes Service

### Get Disputes with Filters
```typescript
import { disputeService } from '@/lib/api/services';

async function loadDisputes() {
  const disputes = await disputeService.getDisputes({
    status: 'open',
    priority: 'high',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  console.log('Total disputes:', disputes.total);
  console.log('Disputes:', disputes.disputes);
}
```

### Resolve Dispute
```typescript
import { disputeService } from '@/lib/api/services';

async function resolveDispute(disputeId: string) {
  await disputeService.resolveDispute(disputeId, {
    resolution: 'refund_customer',
    resolutionNotes: 'Product was defective. Full refund issued.',
    refundAmount: 50.00,
  });
}
```

### Export Disputes
```typescript
import { disputeService } from '@/lib/api/services';

async function exportDisputesReport() {
  const blob = await disputeService.exportDisputes(
    {
      status: 'resolved',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    },
    'excel'
  );

  disputeService.downloadFile(blob, 'disputes_2025.xlsx');
}
```

---

## 🔍 Common Patterns

### API Error Handling
```typescript
import { apiClient } from '@/lib/api/core';

try {
  const data = await apiClient.get('/some/endpoint');
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else {
    // Show error message
    console.error('API Error:', error.message);
  }
}
```

### React Query with Services
```typescript
import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';

function useLandingConfig() {
  return useQuery({
    queryKey: ['landing', 'config'],
    queryFn: () => landingService.getConfig(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage in component
function LandingPage() {
  const { data, isLoading, error } = useLandingConfig();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.data.hero.title}</div>;
}
```

### Mutations with Optimistic Updates
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';

function useUpdateBanner(bannerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => landingService.updateBanner(bannerId, data),
    onMutate: async (newData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['banners'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['banners']);

      // Optimistically update
      queryClient.setQueryData(['banners'], (old) => {
        // Update logic here
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['banners'], context.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
}
```

---

## 📦 Available Hooks

### Upload Hooks
- `useUploadImage()` - Single image upload
- `useUploadImages()` - Multiple images upload
- `useUploadDocument()` - Document upload
- `useDeleteFile()` - File deletion
- `useGetSignedUrl()` - Get signed URL for private files
- `useFileValidation()` - File validation utilities
- `useFileUtils()` - File utility functions

### Service Hooks Pattern
```typescript
// Create custom hooks for your services
import { useQuery, useMutation } from '@tanstack/react-query';
import { yourService } from '@/lib/api/services';

export function useYourData(params) {
  return useQuery({
    queryKey: ['your-data', params],
    queryFn: () => yourService.getData(params),
  });
}

export function useYourMutation() {
  return useMutation({
    mutationFn: (data) => yourService.updateData(data),
  });
}
```

---

## 🎯 Best Practices

### 1. Always Use Type-Safe Services
```typescript
// ✅ Good
import { uploadsService } from '@/lib/api/services';
const result = await uploadsService.uploadImage(file, 'products');

// ❌ Bad
const result = await fetch('/uploads/image', { ... });
```

### 2. Handle Loading and Error States
```typescript
// ✅ Good
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;
return <Content data={data} />;

// ❌ Bad
const { data } = useQuery(...);
return <Content data={data} />; // Can crash if data is undefined
```

### 3. Validate Before Upload
```typescript
// ✅ Good
const { validateImage } = useFileValidation();
const validation = validateImage(file);

if (!validation.valid) {
  toast.error(validation.error);
  return;
}

uploadImage({ file });

// ❌ Bad
uploadImage({ file }); // No validation
```

### 4. Use Query Keys Consistently
```typescript
// ✅ Good
queryKey: ['banners', bannerId]
queryKey: ['reports', 'scheduled']
queryKey: ['disputes', { status, page }]

// ❌ Bad
queryKey: ['data']
queryKey: [Math.random()]
```

---

## 🔗 Useful Links

- [API Documentation](./ADMIN_API_DOCUMENTATION.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Type Definitions](./src/lib/api/types/)
- [Service Implementations](./src/lib/api/services/)
- [Custom Hooks](./src/lib/hooks/)

---

**Last Updated:** October 11, 2025
