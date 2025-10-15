'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [endpoint, setEndpoint] = useState('/uploads/image');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const testUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file); // Use 'file' as field name
      formData.append('folder', 'categories'); // Add folder parameter

      const response = await fetch(`/api/proxy${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type with boundary
        },
      });

      const data = await response.json();

      setResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      });

      if (response.ok) {
        toast.success('Upload successful!');
      } else {
        toast.error(`Upload failed: ${response.status}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
      setResult({
        error: error.message,
        stack: error.stack,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Image Upload Endpoint</CardTitle>
          <CardDescription>
            Test different endpoints to find the correct image upload path
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint Path</label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/categories/upload-image"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Full URL: /api/proxy{endpoint}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Button
            onClick={testUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Test Upload'}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Response Status:</h3>
                <p className="font-mono text-sm">
                  {result.status} {result.statusText}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Response Data:</h3>
                <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold mb-2">Common Endpoints to Try:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEndpoint('/uploads/image')}
                className="mr-2 font-mono text-xs"
              >
                /uploads/image (Correct)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEndpoint('/uploads/images')}
                className="mr-2 font-mono text-xs"
              >
                /uploads/images (Multiple)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEndpoint('/uploads/document')}
                className="mr-2 font-mono text-xs"
              >
                /uploads/document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
