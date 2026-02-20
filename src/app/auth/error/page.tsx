import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Authentication Error | PowerProShop',
};

/**
 * /auth/error
 *
 * Fallback page shown when an auth operation fails.
 * Reached via redirect from /auth/callback when:
 *   - The email link code is invalid
 *   - The email link has expired (otp_expired)
 *   - No code was present in the URL
 */

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Link expired or invalid</CardTitle>
          <CardDescription>
            This link has expired or has already been used.
            Email links are single-use and expire after 30 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
