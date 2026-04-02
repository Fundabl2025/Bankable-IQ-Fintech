import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  MapPin,
  Tag,
  TrendingUp,
  FileText,
  Building2,
  Globe,
  Clock,
  Eye,
  Heart
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  getAllResources,
  filterResources,
  getFilterOptions,
  type Resource,
  type ResourceFilters
} from '../utils/resourcesData';

export function TemplatesAndResources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ResourceFilters>({
    location: 'National',
  });
  
  // Expandable filter sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    topic: false,
    businessStage: false,
    format: false,
    industry: false,
    language: false,
  });

  const filterOptions = getFilterOptions();

  // Filter and search resources
  const filteredResources = useMemo(() => {
    let resources = filterResources(activeFilters);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resources = resources.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.topic.some(t => t.toLowerCase().includes(query))
      );
    }
    
    return resources;
  }, [activeFilters, searchQuery]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilter = (key: keyof ResourceFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: 'topics' | 'businessStages' | 'formats' | 'industries' | 'languages', value: string) => {
    setActiveFilters(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray.length > 0 ? newArray : undefined
      };
    });
  };

  const clearFilter = (key: keyof ResourceFilters) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ location: 'National' });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.topics?.length) count += activeFilters.topics.length;
    if (activeFilters.businessStages?.length) count += activeFilters.businessStages.length;
    if (activeFilters.formats?.length) count += activeFilters.formats.length;
    if (activeFilters.industries?.length) count += activeFilters.industries.length;
    if (activeFilters.languages?.length) count += activeFilters.languages.length;
    return count;
  };

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

  return (
    <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Resources for Your Business Success
          </h1>
          <div className="w-24 h-1 bg-yellow-400 mb-4 sm:mb-6"></div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            Empowering Your Business with the Right Tools
          </h2>
          <p className="text-base sm:text-lg max-w-3xl leading-relaxed">
            Explore a wealth of resources designed to help your business thrive. From expert articles and guides to webinars and templates, we provide the knowledge and tools you need to succeed.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              
              {/* Search Box */}
              <Card className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter keyword or term..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </Card>

              {/* Date Range Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('dateRange')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Date Range</span>
                  {expandedSections.dateRange ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.dateRange && (
                  <div className="p-4 pt-0 border-t">
                    <p className="text-xs text-gray-500 mb-2">Coming soon</p>
                  </div>
                )}
              </Card>

              {/* Location Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('location')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  <span className="font-bold text-sm">By Location</span>
                  {expandedSections.location ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {expandedSections.location && (
                  <div className="p-4 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="location"
                        checked={activeFilters.location === 'National'}
                        onChange={() => updateFilter('location', 'National')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">National</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="location"
                        checked={activeFilters.location === 'Any location'}
                        onChange={() => updateFilter('location', 'Any location')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Any location</span>
                    </label>
                    {activeFilters.location && (
                      <p className="text-xs text-blue-600 pt-2">
                        Select a location to view local content
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Topic Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('topic')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Topic</span>
                  {expandedSections.topic ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.topic && (
                  <div className="p-4 pt-0 border-t space-y-2">
                    {filterOptions.topics.map(topic => (
                      <label key={topic} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.topics?.includes(topic)}
                          onChange={() => toggleArrayFilter('topics', topic)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{topic}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              {/* Business Stage Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('businessStage')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Business Stage</span>
                  {expandedSections.businessStage ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.businessStage && (
                  <div className="p-4 pt-0 border-t space-y-2">
                    {filterOptions.businessStages.map(stage => (
                      <label key={stage} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.businessStages?.includes(stage)}
                          onChange={() => toggleArrayFilter('businessStages', stage)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{stage}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              {/* Format Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('format')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Format</span>
                  {expandedSections.format ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.format && (
                  <div className="p-4 pt-0 border-t space-y-2">
                    {filterOptions.formats.map(format => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.formats?.includes(format)}
                          onChange={() => toggleArrayFilter('formats', format)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{format}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              {/* Industry Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('industry')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Industry</span>
                  {expandedSections.industry ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.industry && (
                  <div className="p-4 pt-0 border-t space-y-2">
                    {filterOptions.industries.map(industry => (
                      <label key={industry} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.industries?.includes(industry)}
                          onChange={() => toggleArrayFilter('industries', industry)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

              {/* Language Filter */}
              <Card className="overflow-hidden">
                <button
                  onClick={() => toggleSection('language')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-blue-700 text-sm">Language</span>
                  {expandedSections.language ? (
                    <ChevronUp className="w-5 h-5 text-blue-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-700" />
                  )}
                </button>
                {expandedSections.language && (
                  <div className="p-4 pt-0 border-t space-y-2">
                    {filterOptions.languages.map(language => (
                      <label key={language} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.languages?.includes(language)}
                          onChange={() => toggleArrayFilter('languages', language)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredResources.length} Results
                </h2>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All Filters
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {(activeFilters.location || getActiveFilterCount() > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">ACTIVE FILTERS:</span>
                  
                  {activeFilters.location && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                      {activeFilters.location}
                      <button
                        onClick={() => clearFilter('location')}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}

                  {activeFilters.topics?.map(topic => (
                    <Badge key={topic} className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1">
                      {topic}
                      <button
                        onClick={() => toggleArrayFilter('topics', topic)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}

                  {activeFilters.businessStages?.map(stage => (
                    <Badge key={stage} className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                      {stage}
                      <button
                        onClick={() => toggleArrayFilter('businessStages', stage)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-600 mt-2">
                Displaying {filteredResources.length > 0 ? '1' : '0'} - {Math.min(12, filteredResources.length)} of {filteredResources.length}
              </p>
            </div>

            {/* Resources Grid */}
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate(`/templates-resources/${resource.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={resource.imageUrl}
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`${getTypeBadgeColor(resource.type)} font-bold text-xs px-3 py-1`}>
                          {resource.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {resource.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {resource.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.readTime}
                          </span>
                        )}
                        {resource.author && (
                          <span className="flex items-center gap-1">
                            By {resource.author}
                          </span>
                        )}
                        {resource.views && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {resource.views}
                          </span>
                        )}
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {resource.topic.slice(0, 3).map(topic => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Resources Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Button onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
