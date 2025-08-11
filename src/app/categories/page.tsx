'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlowingButton } from '@/components/ui/AnimatedCard';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
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
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import {
  useCategories,
  useCategoryStats,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useExportCategories,
  useUploadCategoryImage,
} from '@/lib/hooks/use-categories';
import { Category, CategoryFilters, PaginatedResponse } from '@/lib/api/types';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function CategoriesPage() {
  const { data: session, status } = useSession();

  // Debug session
  console.log('Session status:', status);
  console.log('Session data:', session);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Debug modal state
  console.log('Modal state:', { showModal, editingCategory });
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: undefined as string | undefined,
    isActive: true,
    sortOrder: 0,
    icon: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
  } = useCategories(filters) as {
    data: PaginatedResponse<Category> | undefined;
    isLoading: boolean;
    error: any;
  };
  const {
    data: statsData,
    isLoading: loadingStats,
    error: statsError,
  } = useCategoryStats() as {
    data:
      | {
          totalCategories: number;
          activeCategories: number;
          inactiveCategories: number;
          featuredCategories: number;
          totalProducts: number;
          totalSales: number;
          categoriesGrowth: number;
          productsGrowth: number;
          salesGrowth: number;
        }
      | undefined;
    isLoading: boolean;
    error: any;
  };

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const toggleStatusMutation = useToggleCategoryStatus();
  const exportCategoriesMutation = useExportCategories();
  const uploadImageMutation = useUploadCategoryImage();

  const categories = categoriesData?.categories || [];
  // Handle stats with fallback if there's an error
  type CategoryStats = {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    totalProducts: number;
    totalSales: number;
  };

  const stats: CategoryStats = statsData
    ? {
        total: statsData.totalCategories || 0,
        active: statsData.activeCategories || 0,
        inactive: statsData.inactiveCategories || 0,
        featured: statsData.featuredCategories || 0,
        totalProducts: statsData.totalProducts || 0,
        totalSales: statsData.totalSales || 0,
      }
    : {
        total: categories?.length || 0,
        active: categories?.filter(c => c.isVisible).length || 0,
        inactive: categories?.filter(c => !c.isVisible).length || 0,
        featured: categories?.filter(c => c.featured).length || 0,
        totalProducts: categories?.reduce((sum, c) => sum + (c.productCount || 0), 0) || 0,
        totalSales: categories?.reduce((sum, c) => sum + (c.totalSales || 0), 0) || 0,
      };

  const handleAddCategory = () => {
    console.log('Add Category button clicked');
    console.log('Current modal state before reset:', { showModal, editingCategory });

    // Open modal for new category
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: undefined,
      isActive: true,
      sortOrder: 0,
      icon: '',
      image: '',
    });
    setImageFile(null);
    setImagePreview(null);

    console.log('Form data reset, setting showModal to true');
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId,
      isActive: category.isVisible, // Map isVisible from API to isActive for form
      sortOrder: category.sortOrder,
      icon: category.icon || '',
      image: category.image || '',
    });
    setImageFile(null);
    setImagePreview(category.image || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = async () => {
    console.log('=== CATEGORY SAVE DEBUG ===');
    console.log('Form data:', formData);
    console.log('Editing category:', editingCategory);
    console.log('Session:', session);
    console.log('Is creating:', !editingCategory);

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Category slug is required');
      return;
    }

    try {
      let categoryId: string;

      if (editingCategory) {
        console.log('Updating category...');
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
        categoryId = editingCategory.id;
      } else {
        console.log('Creating new category...');
        console.log('Mutation function available:', !!createCategoryMutation.mutateAsync);
        console.log('Mutation state:', {
          isPending: createCategoryMutation.isPending,
          isError: createCategoryMutation.isError,
          error: createCategoryMutation.error,
        });

        // Prepare data for API (remove undefined parentId)
        const apiData = {
          ...formData,
          parentId: formData.parentId || undefined,
        };

        // Add new category
        const result = await createCategoryMutation.mutateAsync(apiData);
        console.log('Category creation result:', result);
        categoryId = result.id;
      }

      // Upload image if a new file was selected
      if (imageFile && categoryId) {
        console.log('Uploading image for category:', categoryId);
        await uploadImageMutation.mutateAsync({
          categoryId,
          file: imageFile,
        });
      }

      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      // Error is handled by the mutation hooks
      console.error('Error saving category (caught):', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        response: error?.response,
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        // Error is handled by the mutation hook
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(categoryId);
    } catch (error) {
      // Error is handled by the mutation hook
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading state
  if (loadingCategories || loadingStats) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='flex items-center gap-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (categoriesError) {
    return (
      <div className='space-y-8'>
        <PageHeader
          title='Categories Management'
          description='Organize and manage product categories'
          icon={Tag}
        />
        <div className='flex items-center justify-center min-h-96'>
          <div className='text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Failed to load categories</h3>
            <p className='text-gray-600 mb-4'>
              {categoriesError instanceof Error
                ? categoriesError.message
                : 'There was an error loading the categories data.'}
            </p>
            {/* Debug info */}
            <details className='text-left bg-gray-100 p-4 rounded-lg mb-4 max-w-md mx-auto'>
              <summary className='cursor-pointer font-medium'>Debug Info</summary>
              <pre className='text-xs mt-2 whitespace-pre-wrap'>
                {JSON.stringify(categoriesError, null, 2)}
              </pre>
            </details>
            <GlowingButton variant='primary' onClick={() => window.location.reload()}>
              Try Again
            </GlowingButton>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state (but still show stats and header)
  if (!loadingCategories && categories.length === 0) {
    return (
      <div className='space-y-8'>
        {/* Header */}
        <PageHeader
          title='Categories Management'
          description='Organize and manage product categories'
          icon={Tag}
          actions={[
            {
              label: 'Export',
              icon: Download,
              variant: 'secondary',
              onClick: handleExport,
              loading: exportCategoriesMutation.isPending,
            },
            {
              label: 'Add Category',
              icon: Plus,
              variant: 'primary',
              onClick: handleAddCategory,
            },
          ]}
        />

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6'>
          <StatsCard
            title='Total Categories'
            value={stats.total}
            icon={Tag}
            gradient='from-blue-500 to-purple-600'
            delay={0}
          />
          <StatsCard
            title='Active'
            value={stats.active}
            icon={Check}
            gradient='from-green-500 to-emerald-600'
            delay={100}
          />
          <StatsCard
            title='Inactive'
            value={stats.inactive}
            icon={X}
            gradient='from-red-500 to-pink-600'
            delay={200}
          />
          <StatsCard
            title='Featured'
            value={stats.featured}
            icon={Star}
            gradient='from-yellow-500 to-orange-600'
            delay={300}
          />
          <StatsCard
            title='Total Products'
            value={stats.totalProducts}
            icon={Package}
            gradient='from-purple-500 to-pink-600'
            delay={400}
          />
          <StatsCard
            title='Total Sales'
            value={stats.totalSales}
            icon={DollarSign}
            gradient='from-green-500 to-emerald-600'
            format='currency'
            delay={500}
          />
        </div>

        {/* Empty State */}
        <Card className='border-dashed border-2 border-gray-300 bg-gray-50/50'>
          <CardContent className='p-12'>
            <div className='text-center'>
              <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6'>
                <Tag className='h-10 w-10 text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>No categories found</h3>
              <p className='text-gray-600 mb-8 max-w-md mx-auto'>
                Categories help organize your products and make them easier for customers to find.
                Get started by creating your first category.
              </p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <GlowingButton variant='primary' onClick={handleAddCategory} size='lg'>
                  <Plus className='h-5 w-5 mr-2' />
                  Create Your First Category
                </GlowingButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Modal - Empty State */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setImageFile(null);
            setImagePreview(null);
          }}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          size='lg'
        >
          <ModalBody>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Category Name *
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e => {
                      const name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name,
                        // Auto-generate slug if it's empty or matches the previous name's slug
                        slug:
                          !prev.slug ||
                          prev.slug ===
                            prev.name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, '')
                            ? name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '')
                            : prev.slug,
                      }));
                    }}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    placeholder='Enter category name'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Slug *</label>
                  <input
                    type='text'
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    placeholder='category-slug'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Enter category description'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Icon (optional)
                  </label>
                  <input
                    type='text'
                    value={formData.icon}
                    onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    placeholder='e.g. fas fa-home'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Sort Order</label>
                  <input
                    type='number'
                    value={formData.sortOrder}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                    min='0'
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category Image
                </label>
                <div className='space-y-2'>
                  {imagePreview && (
                    <div className='relative w-32 h-32'>
                      <img
                        src={imagePreview}
                        alt='Category preview'
                        className='w-full h-full object-cover rounded-lg'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                      >
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/gif,image/webp'
                    onChange={handleImageChange}
                    className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  />
                  <p className='text-xs text-gray-500'>
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <label htmlFor='isActive' className='text-sm text-gray-700'>
                  Active (visible to customers)
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <GlowingButton
              variant='secondary'
              onClick={() => {
                setShowModal(false);
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Cancel
            </GlowingButton>
            <GlowingButton
              variant='primary'
              onClick={handleSaveCategory}
              loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </GlowingButton>
          </ModalFooter>
        </Modal>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Header */}
      <PageHeader
        title='Categories Management'
        description='Organize and manage product categories'
        icon={Tag}
        actions={[
          {
            label: 'Export',
            icon: Download,
            variant: 'secondary',
            onClick: handleExport,
            loading: exportCategoriesMutation.isPending,
          },
          {
            label: 'Add Category',
            icon: Plus,
            variant: 'primary',
            onClick: handleAddCategory,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6'>
        <StatsCard
          title='Total Categories'
          value={stats.total}
          icon={Tag}
          gradient='from-blue-500 to-purple-600'
          delay={0}
        />
        <StatsCard
          title='Active'
          value={stats.active}
          icon={Check}
          gradient='from-green-500 to-emerald-600'
          delay={100}
        />
        <StatsCard
          title='Inactive'
          value={stats.inactive}
          icon={X}
          gradient='from-red-500 to-pink-600'
          delay={200}
        />
        <StatsCard
          title='Featured'
          value={stats.featured}
          icon={Star}
          gradient='from-yellow-500 to-orange-600'
          delay={300}
        />
        <StatsCard
          title='Total Products'
          value={stats.totalProducts}
          icon={Package}
          gradient='from-purple-500 to-pink-600'
          delay={400}
        />
        <StatsCard
          title='Total Sales'
          value={stats.totalSales}
          icon={DollarSign}
          gradient='from-green-500 to-emerald-600'
          format='currency'
          delay={500}
        />
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>All Categories</CardTitle>
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <input
                  type='search'
                  placeholder='Search categories...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg',
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Grid className='h-4 w-4' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg',
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <List className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {categories.map(category => (
                <div
                  key={category.id}
                  className='bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className='w-12 h-12 rounded-lg object-cover'
                        />
                      ) : (
                        <div
                          className='w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold'
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        >
                          {category.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className='font-semibold text-gray-900'>{category.name}</h3>
                        <p className='text-sm text-gray-600'>
                          {category.productCount || 0} products
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {category.featured && (
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                      )}
                      <span
                        className={cn(
                          'px-2 py-1 text-xs rounded-full',
                          category.isVisible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {category.isVisible ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 mb-4'>
                    {category.description || 'No description'}
                  </p>

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                    <span>Sales: {formatCurrency(category.totalSales || 0)}</span>
                    <span>Rating: {category.averageRating || 0}/5</span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className='flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded'
                    >
                      <Edit className='h-3 w-3' />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 text-sm rounded',
                        category.isVisible
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      )}
                    >
                      {category.isVisible ? (
                        <>
                          <X className='h-3 w-3' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Check className='h-3 w-3' />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className='flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded'
                    >
                      <Trash2 className='h-3 w-3' />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b'>
                    <th className='pb-3 text-left font-medium text-gray-600'>Category</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Products</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Sales</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Rating</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Status</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Updated</th>
                    <th className='pb-3 text-left font-medium text-gray-600'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {categories.map(category => (
                    <tr key={category.id} className='hover:bg-gray-50'>
                      <td className='py-4'>
                        <div className='flex items-center gap-3'>
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className='w-8 h-8 rounded-lg object-cover'
                            />
                          ) : (
                            <div
                              className='w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm'
                              style={{ backgroundColor: category.color || '#3B82F6' }}
                            >
                              {category.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className='font-medium text-gray-900'>{category.name}</p>
                            <p className='text-xs text-gray-500'>{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 text-gray-600'>{category.productCount || 0}</td>
                      <td className='py-4 text-gray-600'>
                        {formatCurrency(category.totalSales || 0)}
                      </td>
                      <td className='py-4 text-gray-600'>{category.averageRating || 0}/5</td>
                      <td className='py-4'>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs rounded-full',
                            category.isVisible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {category.isVisible ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='py-4 text-gray-600'>
                        {format(new Date(category.updatedAt), 'MMM dd, yyyy')}
                      </td>
                      <td className='py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className='p-1 text-blue-600 hover:bg-blue-50 rounded'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className='p-1 text-red-600 hover:bg-red-50 rounded'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setImageFile(null);
          setImagePreview(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        size='lg'
      >
        <ModalBody>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category Name *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e => {
                    const name = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      name,
                      // Auto-generate slug if it's empty or matches the previous name's slug
                      slug:
                        !prev.slug ||
                        prev.slug ===
                          prev.name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                          ? name
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/^-|-$/g, '')
                          : prev.slug,
                    }));
                  }}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Enter category name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Slug *</label>
                <input
                  type='text'
                  value={formData.slug}
                  onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='category-slug'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='Enter category description'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Icon (optional)
                </label>
                <input
                  type='text'
                  value={formData.icon}
                  onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='e.g. fas fa-home'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Sort Order</label>
                <input
                  type='number'
                  value={formData.sortOrder}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  min='0'
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Category Image</label>
              <div className='space-y-2'>
                {imagePreview && (
                  <div className='relative w-32 h-32'>
                    <img
                      src={imagePreview}
                      alt='Category preview'
                      className='w-full h-full object-cover rounded-lg'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                )}
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/gif,image/webp'
                  onChange={handleImageChange}
                  className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                <p className='text-xs text-gray-500'>
                  Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='isActiveMain'
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label htmlFor='isActiveMain' className='text-sm text-gray-700'>
                Active (visible to customers)
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <GlowingButton variant='secondary' onClick={() => setShowModal(false)}>
            Cancel
          </GlowingButton>
          <GlowingButton
            variant='primary'
            onClick={handleSaveCategory}
            loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
          >
            {editingCategory ? 'Update Category' : 'Create Category'}
          </GlowingButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
