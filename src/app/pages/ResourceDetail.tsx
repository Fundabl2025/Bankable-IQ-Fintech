import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Download, Bookmark, User } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getResourceById } from '../utils/resourcesData';

export function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resource = id ? getResourceById(id) : undefined;

  if (!resource) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Resource Not Found</h2>
          <p className="text-gray-600 mb-6">
            The resource you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/templates-resources')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
        </Card>
      </div>
    );
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'BLOG POST': 'bg-blue-600 text-white',
      'ARTICLE': 'bg-blue-600 text-white',
      'TEMPLATE': 'bg-green-600 text-white',
      'GUIDE': 'bg-purple-600 text-white',
      'VIDEO': 'bg-red-600 text-white',
      'WEBINAR': 'bg-orange-600 text-white',
      'EBOOK': 'bg-indigo-600 text-white',
      'CHECKLIST': 'bg-teal-600 text-white',
    };
    return colors[type] || 'bg-gray-600 text-white';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4">
          <Button
            variant="outline"
            onClick={() => navigate('/templates-resources')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        
        {/* Article Header */}
        <article>
          <header className="mb-8">
            {/* Type Badge */}
            <div className="mb-4">
              <Badge className={`${getTypeBadgeColor(resource.type)} font-bold px-4 py-1`}>
                {resource.type}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {resource.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(resource.date)}
              </span>
              
              {resource.author && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {resource.author}
                </span>
              )}
              
              {resource.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {resource.readTime}
                </span>
              )}

              {resource.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {resource.views.toLocaleString()} views
                </span>
              )}

              {resource.likes && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {resource.likes.toLocaleString()} likes
                </span>
              )}
            </div>

            {/* Separator */}
            <div className="w-24 h-1 bg-yellow-400 mb-6"></div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {(resource.type === 'TEMPLATE' || resource.type === 'CHECKLIST' || resource.type === 'EBOOK') && (
                <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </header>

          {/* Hero Image */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={resource.imageUrl}
              alt={resource.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 sm:p-6 mb-8 rounded-r-lg">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: resource.content }}
            style={{
              lineHeight: '1.8',
            }}
          />

          {/* Tags/Topics */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.topic.map(topic => (
                <Badge key={topic} className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Business Stages */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Business Stages
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.businessStage.map(stage => (
                <Badge key={stage} className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Industries
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.industry.map(industry => (
                <Badge key={industry} className="bg-purple-100 text-purple-800 border-purple-300 px-3 py-1">
                  {industry}
                </Badge>
              ))}
            </div>
          </div>

        </article>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to Take Action?
          </h2>
          <p className="text-base sm:text-lg mb-6 opacity-90">
            Apply what you've learned and take your business to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/lender-compliance')}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Your Journey
            </Button>
            <Button
              onClick={() => navigate('/templates-resources')}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Explore More Resources
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
