'use client';

/**
 * Banner Manager Component
 *
 * Manage promotional banners for the landing page with drag-and-drop reordering,
 * scheduling, and analytics.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { CreateBannerModal } from './CreateBannerModal';
import { EditBannerModal } from './EditBannerModal';
import Image from 'next/image';
import { format } from 'date-fns';
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

interface SortableBannerItemProps {
  banner: any;
  onEdit: (banner: any) => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function SortableBannerItem({
  banner,
  onEdit,
  onToggle,
  onDelete,
  isDeleting,
}: SortableBannerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

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

        {/* Banner Preview */}
        <div className="relative w-40 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Banner Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium truncate">{banner.title}</h3>
            {banner.active ? (
              <Badge variant="default" className="text-xs">Active</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
          </div>
          {banner.subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {banner.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            {banner.startDate && (
              <span>
                Start: {format(new Date(banner.startDate), 'MMM d, yyyy')}
              </span>
            )}
            {banner.endDate && (
              <span>
                End: {format(new Date(banner.endDate), 'MMM d, yyyy')}
              </span>
            )}
            <span>{banner.impressions || 0} impressions</span>
            <span>{banner.clickCount || 0} clicks</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(banner.id, !banner.active)}
          >
            {banner.active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(banner)}
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(banner.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function BannerManager() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [banners, setBanners] = useState<any[]>([]);

  // Fetch banners
  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['landing', 'banners'],
    queryFn: () => landingService.getBanners(),
  });

  // Update local state when data changes
  useEffect(() => {
    if (bannersData?.data) {
      setBanners(bannersData.data);
    }
  }, [bannersData]);

  // Delete banner mutation
  const { mutate: deleteBanner, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => landingService.deleteBanner(id),
    onSuccess: () => {
      toast.success('Banner deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['landing', 'banners'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete banner');
    },
  });

  // Toggle banner status
  const { mutate: toggleBanner } = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      landingService.updateBanner(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing', 'banners'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update banner');
    },
  });

  // Update banner order mutation
  const { mutate: updateBannerOrder } = useMutation({
    mutationFn: (bannerIds: string[]) =>
      landingService.updateBannersOrder(bannerIds),
    onSuccess: () => {
      toast.success('Banner order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['landing', 'banners'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update banner order');
      // Revert to original order on error
      if (bannersData?.data) {
        setBanners(bannersData.data);
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
      const oldIndex = banners.findIndex((banner) => banner.id === active.id);
      const newIndex = banners.findIndex((banner) => banner.id === over.id);

      const newBanners = arrayMove(banners, oldIndex, newIndex);
      setBanners(newBanners);

      // Update order on server
      const bannerIds = newBanners.map((banner) => banner.id);
      updateBannerOrder(bannerIds);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteBanner(id);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Banners</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage promotional banners displayed on your homepage
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Image
              src="/empty-state.svg"
              alt="No banners"
              width={200}
              height={200}
              className="mx-auto mb-4 opacity-50"
            />
            <h3 className="text-lg font-medium mb-2">No banners yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first promotional banner to attract customers
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
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
            items={banners.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {banners.map((banner) => (
                <SortableBannerItem
                  key={banner.id}
                  banner={banner}
                  onEdit={setEditingBanner}
                  onToggle={(id, active) => toggleBanner({ id, active })}
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create Modal */}
      <CreateBannerModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Modal */}
      {editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          open={!!editingBanner}
          onClose={() => setEditingBanner(null)}
        />
      )}
    </div>
  );
}
