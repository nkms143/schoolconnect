import React, { useEffect, useState } from 'react';
import { Users2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ClubCard } from '../components/clubs/ClubCard';
import { clubService } from '../services/clubService';
import { adminService } from '../services/adminService';
import { Club } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const ClubsPage: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // New club modal (for Admin)
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('🏫');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubService.getClubs();
      setClubs(data);
    } catch (err) {
      console.error('Failed to load clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !description) return;

    try {
      setIsSubmitting(true);
      await adminService.createNewClub({
        name,
        category,
        description,
        bannerUrl: bannerUrl || undefined,
        iconUrl
      });
      setModalOpen(false);
      setName('');
      setCategory('');
      setDescription('');
      fetchClubs();
    } catch (err: any) {
      alert(err.message || 'Failed to create club');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['ALL', 'Academics & Research', 'Environment & Sustainability', 'Technology & Innovation', 'Athletics & Fitness', 'Fine Arts & Creativity'];

  const filteredClubs = selectedCategory === 'ALL'
    ? clubs
    : clubs.filter(c => c.category === selectedCategory);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> School Extracurriculars
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School Clubs & Student Societies
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
              Explore extracurricular interests, attend student-led workshops, join upcoming school
              competitions, and collaborate with your peers.
            </p>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="mt-4 sm:mt-0 sm:absolute sm:top-8 sm:right-8 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create New Club
              </Button>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Clubs' : cat}
            </button>
          ))}
        </div>

        {/* Clubs Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-semibold">Loading clubs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onStatusChange={() => fetchClubs()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin New Club Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New School Club">
        <form onSubmit={handleCreateClub} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Club Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Model United Nations"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Leadership & Debate"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emoji Icon
              </label>
              <input
                type="text"
                placeholder="e.g. 🏛️"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Purpose
            </label>
            <textarea
              required
              rows={3}
              placeholder="What does this club focus on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cover Banner URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Establish Club
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
