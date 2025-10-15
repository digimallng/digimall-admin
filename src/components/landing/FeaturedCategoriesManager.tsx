'use client';

/**
 * Featured Categories Manager Component
 *
 * Manage featured categories displayed on the landing page with ordering,
 * add/remove functionality, and preview.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';
import { categoryService } from '@/lib/api/services/category.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Loader2, GripVertical, Search, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCategoryItemProps {
  category: any;
  onRemove: (id: string) => void;
  isRemoving: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

function SortableCategoryItem({
  category,
  onRemove,
  isRemoving,
  isSelected,
  onToggleSelect,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(category.categoryId)}
        />

        {/* Drag Handle */}
        <div
          className="cursor-move touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Category Icon/Image */}
        <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {category.iconUrl ? (
            <Image
              src={category.iconUrl}
              alt={category.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
              {category.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{category.name}</h3>
            <Badge variant="outline" className="text-xs">
              Order: {category.order}
            </Badge>
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground truncate">
              {category.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(category.categoryId)}
          disabled={isRemoving}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}

export function FeaturedCategoriesManager() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedFeatured, setSelectedFeatured] = useState<Set<string>>(new Set());

  // Fetch featured categories
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['landing', 'featured-categories'],
    queryFn: () => landingService.getFeaturedCategories(),
  });

  // Update local state when data changes
  useEffect(() => {
    if (featuredData?.data) {
      setCategories(featuredData.data);
    }
  }, [featuredData]);

  // Fetch all categories for selection
  const { data: allCategoriesData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryService.getCategories({ page: 1, limit: 100 }),
    enabled: isAddModalOpen,
  });

  // Add featured category mutation (single)
  const { mutate: addFeaturedCategory, isPending: isAdding } = useMutation({
    mutationFn: (categoryId: string) => landingService.addFeaturedCategory(categoryId),
    onSuccess: () => {
      toast.success('Category added to featured list');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-categories'] });
      setIsAddModalOpen(false);
      setSearchQuery('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add featured category');
    },
  });

  // Bulk add featured categories mutation
  const { mutate: bulkAddCategories, isPending: isBulkAdding } = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      // Add categories sequentially
      for (const categoryId of categoryIds) {
        await landingService.addFeaturedCategory(categoryId);
      }
    },
    onSuccess: () => {
      const count = selectedCategories.size;
      toast.success(`${count} ${count === 1 ? 'category' : 'categories'} added to featured list`);
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-categories'] });
      setSelectedCategories(new Set());
      setIsAddModalOpen(false);
      setSearchQuery('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add categories');
    },
  });

  // Remove featured category mutation (single)
  const { mutate: removeFeaturedCategory, isPending: isRemoving } = useMutation({
    mutationFn: (categoryId: string) => landingService.removeFeaturedCategory(categoryId),
    onSuccess: () => {
      toast.success('Category removed from featured list');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove featured category');
    },
  });

  // Bulk remove featured categories mutation
  const { mutate: bulkRemoveCategories, isPending: isBulkRemoving } = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      // Remove categories sequentially
      for (const categoryId of categoryIds) {
        await landingService.removeFeaturedCategory(categoryId);
      }
    },
    onSuccess: () => {
      const count = selectedFeatured.size;
      toast.success(`${count} ${count === 1 ? 'category' : 'categories'} removed from featured list`);
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-categories'] });
      setSelectedFeatured(new Set());
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove categories');
    },
  });

  // Update order mutation
  const { mutate: updateOrder } = useMutation({
    mutationFn: (order: string[]) => landingService.updateFeaturedCategoriesOrder(order),
    onSuccess: () => {
      toast.success('Category order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-categories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
      // Revert to original order on error
      if (featuredData?.data) {
        setCategories(featuredData.data);
      }
    },
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update order on server
      const categoryIds = newCategories.map((cat) => cat.categoryId);
      updateOrder(categoryIds);
    }
  };

  const handleRemove = (categoryId: string) => {
    if (confirm('Are you sure you want to remove this category from featured list?')) {
      removeFeaturedCategory(categoryId);
    }
  };

  const handleBulkRemove = () => {
    if (selectedFeatured.size === 0) {
      toast.error('No categories selected');
      return;
    }

    if (confirm(`Are you sure you want to remove ${selectedFeatured.size} ${selectedFeatured.size === 1 ? 'category' : 'categories'}?`)) {
      bulkRemoveCategories(Array.from(selectedFeatured));
    }
  };

  const handleBulkAdd = () => {
    if (selectedCategories.size === 0) {
      toast.error('No categories selected');
      return;
    }

    bulkAddCategories(Array.from(selectedCategories));
  };

  const toggleCategorySelection = (categoryId: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedCategories(newSet);
  };

  const toggleFeaturedSelection = (categoryId: string) => {
    const newSet = new Set(selectedFeatured);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedFeatured(newSet);
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map((c) => c.id)));
    }
  };

  const selectAllFeatured = () => {
    if (selectedFeatured.size === categories.length) {
      setSelectedFeatured(new Set());
    } else {
      setSelectedFeatured(new Set(categories.map((c) => c.categoryId)));
    }
  };

  const allCategories = allCategoriesData?.data?.categories || [];

  // Filter out already featured categories
  const availableCategories = allCategories.filter(
    (cat) => !categories.some((featured) => featured.categoryId === cat.id)
  );

  // Search filter
  const filteredCategories = availableCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingFeatured) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Featured Categories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select categories to highlight on your landing page
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedFeatured.size > 0 && (
            <>
              <Badge variant="secondary">{selectedFeatured.size} selected</Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                disabled={isBulkRemoving}
              >
                {isBulkRemoving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove Selected
              </Button>
            </>
          )}
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Featured Categories List */}
      {categories.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No featured categories yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add categories to feature them prominently on your landing page
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Category
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Select All Bar */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={categories.length > 0 && selectedFeatured.size === categories.length}
                onCheckedChange={selectAllFeatured}
              />
              <span className="text-sm font-medium">
                {selectedFeatured.size === categories.length ? 'Deselect All' : 'Select All'}
              </span>
            </div>
            {selectedFeatured.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedFeatured.size} of {categories.length} selected
              </span>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {categories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    onRemove={handleRemove}
                    isRemoving={isRemoving}
                    isSelected={selectedFeatured.has(category.categoryId)}
                    onToggleSelect={toggleFeaturedSelection}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Featured Categories</DialogTitle>
            <DialogDescription>
              Select categories to feature on your landing page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Bulk Actions Header */}
            {selectedCategories.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{selectedCategories.size} selected</Badge>
                  <Button
                    size="sm"
                    onClick={handleBulkAdd}
                    disabled={isBulkAdding}
                  >
                    {isBulkAdding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Selected
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Categories</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by category name..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories List */}
            {isLoadingAll ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchQuery
                  ? 'No categories found matching your search'
                  : 'No available categories to add'}
              </div>
            ) : (
              <>
                {/* Select All Categories */}
                {filteredCategories.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Checkbox
                      checked={filteredCategories.length > 0 && selectedCategories.size === filteredCategories.length}
                      onCheckedChange={selectAllCategories}
                    />
                    <span className="text-sm font-medium">
                      {selectedCategories.size === filteredCategories.length ? 'Deselect All' : 'Select All'}
                    </span>
                    {selectedCategories.size > 0 && (
                      <span className="text-sm text-muted-foreground ml-auto">
                        ({selectedCategories.size}/{filteredCategories.length})
                      </span>
                    )}
                  </div>
                )}

                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredCategories.map((category) => (
                    <Card key={category.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <Checkbox
                          checked={selectedCategories.has(category.id)}
                          onCheckedChange={() => toggleCategorySelection(category.id)}
                        />

                        {/* Category Icon/Image */}
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {category.icon ? (
                            <Image
                              src={category.icon}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Category Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {category.description}
                            </p>
                          )}
                        </div>

                        {/* Quick Add Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addFeaturedCategory(category.id)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
