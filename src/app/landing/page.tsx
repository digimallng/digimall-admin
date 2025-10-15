'use client';

/**
 * Landing Page Management
 *
 * Comprehensive interface for managing the platform's landing page including
 * hero section, banners, featured categories, and featured products.
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/Card';
import { Home, Image, Star, Package } from 'lucide-react';
import { HeroSectionManager } from '@/components/landing/HeroSectionManager';
import { BannerManager } from '@/components/landing/BannerManager';
import { FeaturedCategoriesManager } from '@/components/landing/FeaturedCategoriesManager';
import { FeaturedProductsManager } from '@/components/landing/FeaturedProductsManager';

export default function LandingPageManagement() {
  const [activeTab, setActiveTab] = useState('hero');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Landing Page Management</h1>
        <p className="text-muted-foreground mt-2">
          Customize your platform's homepage to attract and engage customers
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Hero Section
          </TabsTrigger>
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Featured Categories
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Featured Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <Card className="p-6">
            <HeroSectionManager />
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="mt-6">
          <BannerManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card className="p-6">
            <FeaturedCategoriesManager />
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card className="p-6">
            <FeaturedProductsManager />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
