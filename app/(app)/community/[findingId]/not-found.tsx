import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#9b5de5] to-[#3c1a5b]">
      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/community">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
            </Link>
            <h1 className="font-heading text-3xl text-white">Finding Not Found</h1>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-heading text-xl text-primary-text mb-2">Finding Not Found</h3>
              <p className="text-secondary-text mb-6">
                The finding you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/community">
                <Button className="bg-primary hover:bg-white hover:text-[#4a2a6d] border border-primary transition-colors duration-200 text-white">
                  Back to Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}