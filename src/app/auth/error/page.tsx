'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to access this resource.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/icon.svg"
              alt="digiMall"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            There was a problem signing you in
          </p>
        </div>

        {/* Error Card */}
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              We couldn't authenticate your request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <Link href="/auth/login" className="block">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>

            {/* Help Section */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Need help?</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>• Make sure you're using the correct admin credentials</li>
                <li>• Check if your account has been activated</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © 2025 digiMall. All rights reserved.
        </p>
      </div>
    </div>
  );
}
