'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ImageUploader } from '@/components/uploads/ImageUploader';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Package,
  AlertCircle,
  Check,
  X,
  Download,
  Grid,
  List,
  Star,
  DollarSign,
  MoreVertical,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  useCategories,
  useCategoryStatistics,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useExportCategories,
} from '@/lib/hooks/use-categories';
import { Category, CategoryFilters } from '@/lib/api/types';
import { toast } from 'sonner';
import { Card } from '@/components';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: undefined as string | undefined,
    isEnabled: true,
    isFeatured: false,
    sortOrder: 0,
    image: '',
    bannerImage: '',
    seoTitle: '',
    seoDescription: '',
  });

  // API filters
  const filters: CategoryFilters = useMemo(
    () => ({
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: currentPage,
      limit: 20,
    }),
    [searchTerm, statusFilter, currentPage]
  );

  // API hooks
  const {
    data: categoriesData,
    isLoading: loadingCategories,
    error: categoriesError,
    refetch,
  } = useCategories(filters);

  const { data: statsData } = useCategoryStatistics();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();
  const exportCategoriesMutation = useExportCategories();

  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.totalPages || 0;

  const stats = {
    total: statsData?.totalCategories || statsData?.total || 0,
    active: statsData?.activeCategories || statsData?.active || 0,
    inactive: statsData?.inactiveCategories || statsData?.inactive || 0,
    featured: statsData?.topCategories?.length || statsData?.featured || 0,
    totalProducts: statsData?.categoriesWithProducts || statsData?.totalProducts || 0,
    totalSales: statsData?.totalSales || 0,
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: undefined,
      isEnabled: true,
      isFeatured: false,
      sortOrder: 0,
      image: '',
      bannerImage: '',
      seoTitle: '',
      seoDescription: '',
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId,
      isEnabled: category.isEnabled !== undefined ? category.isEnabled : true,
      isFeatured: category.isFeatured || false,
      sortOrder: category.sortOrder || 0,
      image: typeof category.image === 'string' ? category.image : '',
      bannerImage: category.bannerImage || '',
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
    });
    setShowModal(true);
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      // Prepare API data - only send fields with values
      const apiData: any = {
        name: formData.name.trim(),
      };

      // Optional fields - only add if they have values
      if (formData.description?.trim()) {
        apiData.description = formData.description.trim();
      }
      if (formData.parentId) {
        apiData.parentId = formData.parentId;
      }
      if (formData.image) {
        apiData.image = formData.image;
      }
      if (formData.bannerImage?.trim()) {
        apiData.bannerImage = formData.bannerImage.trim();
      }
      if (formData.seoTitle?.trim()) {
        apiData.seoTitle = formData.seoTitle.trim();
      }
      if (formData.seoDescription?.trim()) {
        apiData.seoDescription = formData.seoDescription.trim();
      }

      // Always send boolean and number fields
      apiData.isEnabled = formData.isEnabled;
      apiData.isFeatured = formData.isFeatured;
      apiData.sortOrder = formData.sortOrder || 0;

      // Note: slug is auto-generated by backend, don't send it

      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: apiData,
        });
      } else {
        await createCategoryMutation.mutateAsync(apiData);
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.error(error?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(categoryId);
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportCategoriesMutation.mutateAsync(filters);
    } catch (error) {
      console.error('Error exporting categories:', error);
    }
  };

  if (loadingCategories) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <ErrorMessage
          title='Failed to load categories'
          message='There was an error loading the categories data.'
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Categories Management</h1>
          <p className='text-muted-foreground mt-1'>
            Organize and manage product categories
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={handleExport} variant='outline' disabled={exportCategoriesMutation.isPending}>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button onClick={handleAddCategory}>
            <Plus className='h-4 w-4 mr-2' />
            Add Category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Categories
            </CardTitle>
            <Tag className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              All categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.active}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Inactive
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.inactive}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Not active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Featured
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.featured}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Featured items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Products
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalProducts}</div>
            <p className='text-xs text-muted-foreground mt-1'>
              Products listed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Sales
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ₦{stats.totalSales.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Revenue generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-1 items-center gap-4'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search categories...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>

              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size='icon'
                onClick={() => setViewMode('grid')}
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size='icon'
                onClick={() => setViewMode('list')}
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {categories.length === 0 ? (
            <div className='text-center py-12'>
              <Tag className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No categories found</h3>
              <p className='text-muted-foreground mb-4'>
                Create your first category to get started
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className='h-4 w-4 mr-2' />
                Add Category
              </Button>
            </div>
          ) : (
            <Tabs value={viewMode} className='space-y-4'>
              <TabsContent value='grid'>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {categories.map((category) => (
                    <Card key={category.id} className='overflow-hidden'>
                      <CardContent className='p-6'>
                        <div className='flex items-start justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className='w-12 h-12 rounded-lg object-cover'
                              />
                            ) : (
                              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center'>
                                <Tag className='h-6 w-6 text-primary' />
                              </div>
                            )}
                            <div>
                              <h3 className='font-semibold'>{category.name}</h3>
                              <p className='text-sm text-muted-foreground'>
                                {category.productCount || 0} products
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className='h-4 w-4 mr-2' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                                {category.isActive ? (
                                  <>
                                    <X className='h-4 w-4 mr-2' />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check className='h-4 w-4 mr-2' />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCategory(category.id)}
                                className='text-red-600'
                              >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className='text-sm text-muted-foreground mb-4 line-clamp-2'>
                          {category.description || 'No description'}
                        </p>

                        <div className='flex items-center gap-2 flex-wrap'>
                          <Badge variant={category.isActive ? 'default' : 'secondary'}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {category.isFeatured && (
                            <Badge variant='outline' className='gap-1'>
                              <Star className='h-3 w-3 fill-current' />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value='list'>
                <div className='border rounded-lg'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b bg-muted/50'>
                        <th className='px-4 py-3 text-left text-sm font-medium'>Category</th>
                        <th className='px-4 py-3 text-left text-sm font-medium'>Products</th>
                        <th className='px-4 py-3 text-left text-sm font-medium'>Status</th>
                        <th className='px-4 py-3 text-left text-sm font-medium'>Featured</th>
                        <th className='px-4 py-3 text-left text-sm font-medium'>Updated</th>
                        <th className='px-4 py-3 text-right text-sm font-medium'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {categories.map((category) => (
                        <tr key={category.id} className='hover:bg-muted/50'>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-3'>
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className='w-8 h-8 rounded-lg object-cover'
                                />
                              ) : (
                                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                                  <Tag className='h-4 w-4 text-primary' />
                                </div>
                              )}
                              <div>
                                <p className='font-medium'>{category.name}</p>
                                <p className='text-xs text-muted-foreground'>{category.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-sm'>{category.productCount || 0}</td>
                          <td className='px-4 py-3'>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className='px-4 py-3 text-sm'>
                            {category.isFeatured ? 'Yes' : 'No'}
                          </td>
                          <td className='px-4 py-3 text-sm text-muted-foreground'>
                            {format(new Date(category.updatedAt), 'MMM dd, yyyy')}
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className='max-w-2xl max-h-[90vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category information'
                : 'Create a new category for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 py-4 overflow-y-auto flex-1'>
            {/* Image Upload */}
            <div className='space-y-3'>
              <label className='text-sm font-medium'>Category Image</label>
              <ImageUploader
                mode="single"
                folder="categories"
                value={formData.image}
                onChange={handleImageChange}
                placeholder="Upload category image"
                aspectRatio="1/1"
                showPreview={true}
              />
              <p className='text-xs text-muted-foreground'>
                Recommended size: 400x400px (1:1 aspect ratio)
              </p>
            </div>

            {/* Basic Info */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>
                Category Name <span className='text-red-500'>*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='e.g., Electronics'
              />
              <p className='text-xs text-muted-foreground'>
                Slug will be auto-generated from the category name
              </p>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder='Describe this category...'
                rows={3}
              />
            </div>

            {/* SEO Fields */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>SEO Title (optional)</label>
                <Input
                  value={formData.seoTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder='e.g., Electronics - Shop Online'
                  maxLength={200}
                />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Sort Order</label>
                <Input
                  type='number'
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  min='0'
                  placeholder='0'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>SEO Description (optional)</label>
              <Textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder='SEO meta description...'
                rows={2}
                maxLength={300}
              />
              <p className='text-xs text-muted-foreground'>
                {formData.seoDescription.length}/300 characters
              </p>
            </div>

            <div className='flex items-center gap-6'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isEnabled'
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isEnabled: checked as boolean }))
                  }
                />
                <label htmlFor='isEnabled' className='text-sm font-medium cursor-pointer'>
                  Enabled (visible to customers)
                </label>
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isFeatured'
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked as boolean }))
                  }
                />
                <label htmlFor='isFeatured' className='text-sm font-medium cursor-pointer'>
                  Featured category
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
              }
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
