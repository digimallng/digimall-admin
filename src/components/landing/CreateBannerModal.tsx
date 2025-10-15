'use client';

/**
 * Create Banner Modal Component
 *
 * Modal dialog for creating new promotional banners with title, subtitle,
 * image upload, call-to-action, and scheduling options.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { landingService } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/uploads/ImageUploader';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { CreateBannerInput } from '@/lib/api/types/landing.types';

interface CreateBannerModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
}

export function CreateBannerModal({ open, onClose }: CreateBannerModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Omit<CreateBannerInput, 'imageUrl'> & { imageUrl?: string }>({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    active: true,
    startDate: undefined,
    endDate: undefined,
  });

  // Create banner mutation
  const { mutate: createBanner, isPending } = useMutation({
    mutationFn: (data: CreateBannerInput) => landingService.createBanner(data),
    onSuccess: () => {
      toast.success('Banner created successfully');
      queryClient.invalidateQueries({ queryKey: ['landing', 'banners'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create banner');
    },
  });

  const handleClose = () => {
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      active: true,
      startDate: undefined,
      endDate: undefined,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Banner title is required');
      return;
    }

    if (!formData.imageUrl) {
      toast.error('Banner image is required');
      return;
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end <= start) {
        toast.error('End date must be after start date');
        return;
      }
    }

    createBanner(formData as CreateBannerInput);
  };

  const handleImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Banner</DialogTitle>
          <DialogDescription>
            Add a new promotional banner to your landing page
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Banner Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Summer Sale 2024"
              required
            />
            <p className="text-xs text-muted-foreground">
              The main heading displayed on the banner
            </p>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Up to 50% off on selected items"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Supporting text displayed below the title
            </p>
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label>Banner Image *</Label>
            <ImageUploader
              mode="single"
              folder="landing/banners"
              value={formData.imageUrl}
              onChange={handleImageChange}
              placeholder="Upload banner image"
              aspectRatio="16/9"
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 1920x1080px (16:9 aspect ratio)
            </p>
          </div>

          {/* Call-to-Action */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                placeholder="Shop Now"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                value={formData.ctaLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                placeholder="/products/sale"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                When the banner should start displaying
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                When the banner should stop displaying
              </p>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Display this banner immediately after creation
              </p>
            </div>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Banner
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
