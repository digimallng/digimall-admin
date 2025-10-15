'use client';

/**
 * Hero Section Manager Component
 *
 * Manage hero slides for the landing page carousel
 * Based on ADMIN_API_DOCUMENTATION.md - Hero Slides Management
 */

import { useState } from 'react';
import {
  useHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
} from '@/lib/hooks/use-landing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { HeroSlide } from '@/lib/api/types/landing.types';
import { HeroSlideForm } from './HeroSlideForm';

export function HeroSectionManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Fetch hero slides
  const { data: response, isLoading } = useHeroSlides();

  // Mutations
  const { mutate: createSlide } = useCreateHeroSlide();
  const { mutate: updateSlide } = useUpdateHeroSlide();
  const { mutate: deleteSlide } = useDeleteSlide();

  const slides = response?.data || [];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingSlide(null);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;

    deleteSlide(id, {
      onSuccess: () => {
        toast.success('Hero slide deleted successfully');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to delete hero slide');
      },
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSlide(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isCreating || editingSlide) {
    return (
      <HeroSlideForm
        slide={editingSlide}
        onCancel={handleCancel}
        isEdit={!!editingSlide}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Hero Slides</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage carousel slides displayed on the landing page
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hero Slide
        </Button>
      </div>

      {/* Slides List */}
      {slides.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">No hero slides yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first hero slide to showcase featured content on your landing page
            </p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Hero Slide
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slides
            .sort((a, b) => a.order - b.order)
            .map((slide) => (
              <Card key={slide._id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Slide Preview */}
                  <div className="relative h-24 w-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {slide.heroImage ? (
                      <img
                        src={slide.heroImage}
                        alt={slide.headline}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {slide.eventBadge && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {slide.eventBadge}
                      </div>
                    )}
                  </div>

                  {/* Slide Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{slide.headline}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {slide.description}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1">
                            {slide.isActive ? (
                              <>
                                <Eye className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Inactive</span>
                              </>
                            )}
                          </span>
                          <span className="text-muted-foreground">Order: {slide.order}</span>
                          <span className="text-muted-foreground">
                            Theme: {slide.theme.charAt(0).toUpperCase() + slide.theme.slice(1)}
                          </span>
                          {slide.ctaButtons && slide.ctaButtons.length > 0 && (
                            <span className="text-muted-foreground">
                              {slide.ctaButtons.length} CTA{slide.ctaButtons.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {(slide.startDate || slide.endDate) && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {slide.startDate && (
                              <span>From: {new Date(slide.startDate).toLocaleDateString()} </span>
                            )}
                            {slide.endDate && (
                              <span>To: {new Date(slide.endDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(slide)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(slide._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
