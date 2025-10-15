'use client';

/**
 * Hero Slide Form Component
 *
 * Form for creating and editing hero slides
 */

import { useState, useEffect } from 'react';
import { useCreateHeroSlide, useUpdateHeroSlide } from '@/lib/hooks/use-landing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { ImageUploader } from '@/components/uploads/ImageUploader';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { HeroSlide, CreateHeroSlideRequest, CTAButton } from '@/lib/api/types/landing.types';

interface HeroSlideFormProps {
  slide?: HeroSlide | null;
  onCancel: () => void;
  isEdit?: boolean;
}

export function HeroSlideForm({ slide, onCancel, isEdit = false }: HeroSlideFormProps) {
  const [formData, setFormData] = useState<CreateHeroSlideRequest>({
    eventBadge: '',
    headline: '',
    description: '',
    ctaButtons: [
      {
        text: 'Shop Now',
        link: '/products',
        style: 'primary',
      },
    ],
    heroImage: '',
    mobileImage: '',
    theme: 'dark',
    order: 1,
    isActive: true,
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
  });

  // Mutations
  const { mutate: createSlide, isPending: isCreating } = useCreateHeroSlide();
  const { mutate: updateSlide, isPending: isUpdating } = useUpdateHeroSlide();

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (slide) {
      setFormData({
        eventBadge: slide.eventBadge || '',
        headline: slide.headline,
        description: slide.description,
        ctaButtons: slide.ctaButtons,
        heroImage: slide.heroImage,
        mobileImage: slide.mobileImage,
        theme: slide.theme,
        order: slide.order,
        isActive: slide.isActive,
        startDate: slide.startDate,
        endDate: slide.endDate,
        backgroundColor: slide.backgroundColor,
        textColor: slide.textColor,
      });
    }
  }, [slide]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && slide) {
      updateSlide(
        { id: slide._id, data: formData },
        {
          onSuccess: () => {
            toast.success('Hero slide updated successfully');
            onCancel();
          },
          onError: (error: Error) => {
            toast.error(error.message || 'Failed to update hero slide');
          },
        }
      );
    } else {
      createSlide(formData, {
        onSuccess: () => {
          toast.success('Hero slide created successfully');
          onCancel();
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to create hero slide');
        },
      });
    }
  };

  const addCTAButton = () => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: [
        ...prev.ctaButtons,
        {
          text: '',
          link: '',
          style: 'secondary',
        },
      ],
    }));
  };

  const removeCTAButton = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index),
    }));
  };

  const updateCTAButton = (index: number, field: keyof CTAButton, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((btn, i) =>
        i === index ? { ...btn, [field]: value } : btn
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {isEdit ? 'Edit Hero Slide' : 'Create Hero Slide'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEdit
              ? 'Update the hero slide information'
              : 'Add a new slide to the hero carousel'}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Event Badge */}
      <div className="space-y-2">
        <Label htmlFor="eventBadge">Event Badge (Optional)</Label>
        <Input
          id="eventBadge"
          value={formData.eventBadge}
          onChange={(e) => setFormData((prev) => ({ ...prev, eventBadge: e.target.value }))}
          placeholder="FLASH SALE"
        />
        <p className="text-xs text-muted-foreground">
          Small badge displayed at the top of the slide
        </p>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline">Headline *</Label>
        <Input
          id="headline"
          value={formData.headline}
          onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
          placeholder="Big Deals on Premium Electronics"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Get up to 50% off on selected items"
          rows={3}
          required
        />
      </div>

      {/* Hero Image */}
      <div className="space-y-2">
        <Label>Hero Image *</Label>
        <ImageUploader
          mode="single"
          folder="landing/hero"
          value={formData.heroImage}
          onChange={(url) => setFormData((prev) => ({ ...prev, heroImage: url }))}
          placeholder="Upload hero image"
          aspectRatio="21/9"
        />
        <p className="text-xs text-muted-foreground">Recommended: 1920x823px</p>
      </div>

      {/* Mobile Image */}
      <div className="space-y-2">
        <Label>Mobile Image (Optional)</Label>
        <ImageUploader
          mode="single"
          folder="landing/hero"
          value={formData.mobileImage}
          onChange={(url) => setFormData((prev) => ({ ...prev, mobileImage: url }))}
          placeholder="Upload mobile-optimized image"
          aspectRatio="4/3"
        />
        <p className="text-xs text-muted-foreground">Recommended: 800x600px</p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Call-to-Action Buttons *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCTAButton}>
            <Plus className="h-4 w-4 mr-2" />
            Add CTA
          </Button>
        </div>

        {formData.ctaButtons.map((cta, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
            <div className="col-span-4">
              <Label>Button Text</Label>
              <Input
                value={cta.text}
                onChange={(e) => updateCTAButton(index, 'text', e.target.value)}
                placeholder="Shop Now"
                required
              />
            </div>
            <div className="col-span-4">
              <Label>Link</Label>
              <Input
                value={cta.link}
                onChange={(e) => updateCTAButton(index, 'link', e.target.value)}
                placeholder="/products"
                required
              />
            </div>
            <div className="col-span-3">
              <Label>Style</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={cta.style}
                onChange={(e) =>
                  updateCTAButton(index, 'style', e.target.value as CTAButton['style'])
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div className="col-span-1 flex items-end">
              {formData.ctaButtons.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCTAButton(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Theme & Colors */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            value={formData.theme}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'colorful' }))
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="colorful">Colorful</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Background Color</Label>
          <Input
            type="color"
            value={formData.backgroundColor}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, backgroundColor: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Text Color</Label>
          <Input
            type="color"
            value={formData.textColor}
            onChange={(e) => setFormData((prev) => ({ ...prev, textColor: e.target.value }))}
          />
        </div>
      </div>

      {/* Order & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) }))
            }
            required
          />
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <Label>Active</Label>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
          />
        </div>
      </div>

      {/* Schedule (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date (Optional)</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate ? formData.startDate.slice(0, 16) : ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate ? formData.endDate.slice(0, 16) : ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined }))
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Update Slide' : 'Create Slide'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
