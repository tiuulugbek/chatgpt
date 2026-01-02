'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { ReviewPlatform } from '@prisma/client';
import Link from 'next/link';

const platformConfig: Record<ReviewPlatform, { label: string; icon: string; color: string }> = {
  GOOGLE_MAPS: { label: 'Google Maps', icon: '🗺️', color: 'bg-blue-100 text-blue-800' },
  YANDEX_MAPS: { label: 'Yandex Maps', icon: '🗺️', color: 'bg-yellow-100 text-yellow-800' },
  TRIPADVISOR: { label: 'TripAdvisor', icon: '✈️', color: 'bg-green-100 text-green-800' },
  TWOGIS: { label: '2GIS', icon: '📍', color: 'bg-purple-100 text-purple-800' },
  OTHER: { label: 'Boshqa', icon: '📝', color: 'bg-gray-100 text-gray-800' },
};

const ratingStars = (rating: number) => {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
};

export default function ReviewsPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [hasResponseFilter, setHasResponseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>('');

  // Branches for filter
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
    enabled: !!user && isAdmin,
  });

  // Reviews list
  const queryParams = new URLSearchParams();
  if (platformFilter !== 'all') queryParams.append('platform', platformFilter);
  if (ratingFilter !== 'all') queryParams.append('rating', ratingFilter);
  if (hasResponseFilter !== 'all') queryParams.append('hasResponse', hasResponseFilter);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', platformFilter, ratingFilter, hasResponseFilter],
    queryFn: async () => {
      const response = await api.get(`/reviews?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!user,
  });

  // Statistics
  const { data: statistics } = useQuery({
    queryKey: ['reviewsStatistics'],
    queryFn: async () => {
      const response = await api.get('/reviews/statistics');
      return response.data;
    },
    enabled: !!user,
  });

  // Update review (add response)
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      const response_data = await api.patch(`/reviews/${id}`, { response });
      return response_data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsStatistics'] });
      setResponseText('');
      setSelectedReview(null);
      alert('Javob muvaffaqiyatli saqlandi!');
    },
    onError: (error: any) => {
      alert('Javob saqlashda xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  // Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewsStatistics'] });
      alert('Sharh muvaffaqiyatli o\'chirildi!');
    },
    onError: (error: any) => {
      alert('Sharhni o\'chirishda xatolik: ' + (error.response?.data?.message || error.message));
    },
  });

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    let filtered = reviews;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (review: any) =>
          review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.branch?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [reviews, searchQuery]);

  const handleResponseSubmit = (reviewId: string) => {
    if (!responseText.trim()) {
      alert('Javob matnini kiriting!');
      return;
    }
    updateReviewMutation.mutate({ id: reviewId, response: responseText });
  };

  const handleDelete = (id: string) => {
    if (confirm('Haqiqatan ham bu sharhni o\'chirmoqchimisiz?')) {
      deleteReviewMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Sharhlar yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sharhlar</h1>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Jami Sharhlar</p>
              <p className="text-2xl font-bold text-primary mt-1">{statistics.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">O'rtacha Reyting</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {statistics.averageRating?.toFixed(1) || '0.0'} ⭐
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Javob Berilgan</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{statistics.withResponse}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Javob Berilmagan</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statistics.withoutResponse}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qidiruv</label>
              <input
                type="text"
                placeholder="Sharh, muallif, filial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platforma</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                {Object.values(ReviewPlatform).map((platform) => (
                  <option key={platform} value={platform}>
                    {platformConfig[platform as ReviewPlatform].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reyting</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                <option value="5">5 yulduz</option>
                <option value="4">4 yulduz</option>
                <option value="3">3 yulduz</option>
                <option value="2">2 yulduz</option>
                <option value="1">1 yulduz</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Javob Holati</label>
              <select
                value={hasResponseFilter}
                onChange={(e) => setHasResponseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                <option value="true">Javob berilgan</option>
                <option value="false">Javob berilmagan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Sharhlar ({filteredReviews.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 overflow-y-auto max-h-[calc(100vh-400px)]">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review: any) => (
                  <div
                    key={review.id}
                    onClick={() => setSelectedReview(review.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                      selectedReview === review.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{platformConfig[review.platform as ReviewPlatform]?.icon || '📝'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{review.authorName || 'Noma\'lum'}</p>
                          <p className="text-xs text-gray-500">
                            {platformConfig[review.platform as ReviewPlatform]?.label || review.platform}
                            {review.branch && ` • ${review.branch.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">
                          {ratingStars(review.rating)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{review.comment}</p>
                    )}
                    {review.response && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        ✓ Javob berilgan
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Sharhlar topilmadi.
                </div>
              )}
            </div>
          </div>

          {/* Review Details */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6 h-fit">
            {selectedReview ? (
              <ReviewDetails
                reviewId={selectedReview}
                responseText={responseText}
                setResponseText={setResponseText}
                onResponseSubmit={handleResponseSubmit}
                onDelete={handleDelete}
                deleteMutation={deleteReviewMutation}
                updateMutation={updateReviewMutation}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                Sharh tanlang
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReviewDetails({
  reviewId,
  responseText,
  setResponseText,
  onResponseSubmit,
  onDelete,
  deleteMutation,
  updateMutation,
}: any) {
  const { data: review, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    },
    enabled: !!reviewId,
  });

  if (isLoading) {
    return <div className="text-center py-4">Yuklanmoqda...</div>;
  }

  if (!review) {
    return <div className="text-center py-4 text-gray-500">Sharh topilmadi.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{platformConfig[review.platform as ReviewPlatform]?.icon || '📝'}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{review.authorName || 'Noma\'lum'}</h3>
              <p className="text-xs text-gray-500">
                {platformConfig[review.platform as ReviewPlatform]?.label || review.platform}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-yellow-600">
              {ratingStars(review.rating)}
            </p>
          </div>
        </div>
        {review.branch && (
          <p className="text-sm text-gray-600 mb-2">
            Filial: <Link href={`/admin/branches`} className="text-primary hover:underline">{review.branch.name}</Link>
          </p>
        )}
        <p className="text-xs text-gray-500 mb-4">
          {new Date(review.createdAt).toLocaleString('uz-UZ')}
        </p>
      </div>

      {review.comment && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-800">{review.comment}</p>
        </div>
      )}

      {review.platformUrl && (
        <a
          href={review.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-primary hover:underline"
        >
          Platformada ko'rish →
        </a>
      )}

      {review.response && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs font-medium text-green-800 mb-1">Javob:</p>
          <p className="text-sm text-green-900">{review.response}</p>
          {review.respondedAt && (
            <p className="text-xs text-green-600 mt-2">
              {new Date(review.respondedAt).toLocaleString('uz-UZ')}
            </p>
          )}
        </div>
      )}

      {!review.response && (
        <div className="space-y-3 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700">Javob yozish</label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Javob matnini kiriting..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => onResponseSubmit(reviewId)}
            disabled={updateMutation.isPending || !responseText.trim()}
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saqlanmoqda...' : 'Javobni Saqlash'}
          </button>
        </div>
      )}

      <div className="pt-4 border-t">
        <button
          onClick={() => onDelete(reviewId)}
          disabled={deleteMutation.isPending}
          className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          {deleteMutation.isPending ? 'O\'chirilmoqda...' : 'Sharhni O\'chirish'}
        </button>
      </div>
    </div>
  );
}

