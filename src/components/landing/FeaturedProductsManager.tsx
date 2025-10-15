'use client';

/**
 * Featured Products Manager Component
 *
 * Manage featured products displayed on the landing page with ordering,
 * add/remove functionality, product search, and preview.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, GripVertical, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';
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

interface SortableProductItemProps {
  product: any;
  onRemove: (id: string) => void;
  isRemoving: boolean;
  formatPrice: (price: number) => string;
}

function SortableProductItem({
  product,
  onRemove,
  isRemoving,
  formatPrice,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          className="cursor-move touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Product Image */}
        <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{product.name}</h3>
            <Badge variant="outline" className="text-xs">
              Order: {product.order}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {product.vendorName && `By ${product.vendorName}`}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {product.price && (
              <span className="font-semibold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
            {product.rating && (
              <span className="text-muted-foreground">
                ⭐ {product.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(product.productId)}
          disabled={isRemoving}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}

export function FeaturedProductsManager() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch featured products
  const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['landing', 'featured-products'],
    queryFn: () => landingService.getFeaturedProducts(),
  });

  // Update local state when data changes
  useEffect(() => {
    if (featuredData?.data) {
      setProducts(featuredData.data);
    }
  }, [featuredData]);

  // Search products
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get(`/products`, {
        params: {
          search: query,
          page: 1,
          limit: 20,
          status: 'active',
        },
      });

      setSearchResults(response.data?.products || []);
    } catch (error) {
      toast.error('Failed to search products');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Add featured product mutation
  const { mutate: addFeaturedProduct, isPending: isAdding } = useMutation({
    mutationFn: (productId: string) => landingService.addFeaturedProduct(productId),
    onSuccess: () => {
      toast.success('Product added to featured list');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-products'] });
      setIsAddModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add featured product');
    },
  });

  // Remove featured product mutation
  const { mutate: removeFeaturedProduct, isPending: isRemoving } = useMutation({
    mutationFn: (productId: string) => landingService.removeFeaturedProduct(productId),
    onSuccess: () => {
      toast.success('Product removed from featured list');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove featured product');
    },
  });

  // Update order mutation
  const { mutate: updateOrder } = useMutation({
    mutationFn: (order: string[]) => landingService.updateFeaturedProductsOrder(order),
    onSuccess: () => {
      toast.success('Product order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['landing', 'featured-products'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order');
      // Revert to original order on error
      if (featuredData?.data) {
        setProducts(featuredData.data);
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
      const oldIndex = products.findIndex((prod) => prod.id === active.id);
      const newIndex = products.findIndex((prod) => prod.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      setProducts(newProducts);

      // Update order on server
      const productIds = newProducts.map((prod) => prod.productId);
      updateOrder(productIds);
    }
  };

  const handleRemove = (productId: string) => {
    if (confirm('Are you sure you want to remove this product from featured list?')) {
      removeFeaturedProduct(productId);
    }
  };

  // Filter out already featured products from search results
  const filteredResults = searchResults.filter(
    (product) => !products.some((featured) => featured.productId === product.id)
  );

  if (isLoadingFeatured) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Featured Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select products to showcase on your landing page
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Featured Products List */}
      {products.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No featured products yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add products to feature them prominently on your landing page
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Product
            </Button>
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {products.map((product) => (
                <SortableProductItem
                  key={product.id}
                  product={product}
                  onRemove={handleRemove}
                  isRemoving={isRemoving}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Featured Product</DialogTitle>
            <DialogDescription>
              Search and select a product to feature on your landing page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by product name, SKU, or vendor..."
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Products List */}
            {!searchQuery.trim() ? (
              <div className="text-center p-8 text-muted-foreground">
                Start typing to search for products
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {searchResults.length === 0
                  ? 'No products found matching your search'
                  : 'All matching products are already featured'}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredResults.map((product) => (
                  <Card key={product.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground mb-1">
                          {product.vendor?.businessName && `By ${product.vendor.businessName}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          {product.price && (
                            <span className="font-semibold text-primary">
                              {formatPrice(product.price)}
                            </span>
                          )}
                          {product.rating && (
                            <span className="text-muted-foreground">
                              ⭐ {product.rating.toFixed(1)}
                            </span>
                          )}
                          {product.stock !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {product.stock} in stock
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="sm"
                        onClick={() => addFeaturedProduct(product.id)}
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
