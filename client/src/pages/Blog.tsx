/**
 * Blog Page
 *
 * Blog listing page with lead capture.
 */

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Blog() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();

  const handleReadMore = (postId: number, title: string) => {
    trigger('blog', { postId, title });
  };

  const posts = [
    {
      id: 1,
      title: '10 Tips for First-Time Home Buyers in BC',
      excerpt: 'Essential advice for navigating the BC housing market as a first-time buyer. Learn what you need to know before making an offer.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      date: '2025-01-15',
      category: 'Buying Tips',
    },
    {
      id: 2,
      title: 'Understanding Government Incentives in 2025',
      excerpt: 'A comprehensive guide to all available first-time buyer programs and how to maximize your savings.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      date: '2025-01-10',
      category: 'Incentives',
    },
    {
      id: 3,
      title: 'Best Neighborhoods for Young Families',
      excerpt: 'Discover the top BC neighborhoods offering great schools, parks, and community amenities for growing families.',
      image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=600',
      date: '2025-01-05',
      category: 'Neighborhoods',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog & Resources
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Expert insights, market trends, and helpful guides for BC home buyers
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleReadMore(post.id, post.title)}
                    variant="outline"
                    className="w-full"
                  >
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Full blog CMS and content management coming soon
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={close}
        source={source}
        metadata={metadata}
        onSuccess={onSuccess}
      />
    </div>
  );
}
