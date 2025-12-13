/**
 * Admin Offers Page - Manage all submitted offers
 *
 * Phase 6: Task 6.5 - Offer management system
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  FileText, Eye, CheckCircle, XCircle, Clock, DollarSign,
  Home, Calendar, User, MessageSquare, RefreshCw, Filter
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import AdminSidebar from '../components/AdminSidebar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

interface Offer {
  id: string;
  userId: string;
  propertyAddress: string;
  propertyDetails: {
    price: number;
    beds?: number;
    baths?: number;
  };
  offerDetails: {
    offerPrice: number;
    subjects: string[];
    expiryDate: string;
    possessionDate: string;
    deposit: number;
    notes?: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  adminNotes?: string;
}

export default function AdminOffers() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'accepted' | 'rejected' | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/admin/login');
      return;
    }

    loadOffers();
  }, [isAuthenticated, user]);

  const loadOffers = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/offers/admin/all', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load offers');
      }

      const data = await response.json();
      setOffers(data.data || []);

    } catch (error: any) {
      console.error('Load offers error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load offers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewOffer = async (offerId: string, status: 'accepted' | 'rejected', notes: string) => {
    try {
      const response = await fetch(`/api/offers/admin/${offerId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          adminNotes: notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to review offer');
      }

      toast({
        title: 'Success',
        description: `Offer ${status} successfully`,
      });

      // Reload offers
      await loadOffers();

      // Close modal
      setSelectedOffer(null);
      setReviewNotes('');
      setReviewAction(null);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review offer',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return { icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Accepted' };
      case 'rejected':
        return { icon: XCircle, color: 'text-danger', bg: 'bg-danger-light', label: 'Rejected' };
      case 'submitted':
      case 'under_review':
        return { icon: Clock, color: 'text-warning', bg: 'bg-warning-light', label: 'Under Review' };
      case 'draft':
        return { icon: FileText, color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Draft' };
      case 'withdrawn':
        return { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Withdrawn' };
      default:
        return { icon: FileText, color: 'text-muted-foreground', bg: 'bg-secondary', label: status };
    }
  };

  const filteredOffers = offers.filter((offer) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return offer.status === 'submitted' || offer.status === 'under_review';
    return offer.status === filter;
  });

  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === 'submitted' || o.status === 'under_review').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-white to-background">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 px-4 md:px-8 py-8 md:ml-64 transition-all duration-300">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                  Offer Management
                </h1>
                <p className="text-lg text-muted-foreground">
                  Review and manage all submitted property offers
                </p>
              </div>
              <Button
                onClick={loadOffers}
                variant="outline"
                className="border-primary/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Offers</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.total}</p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <Clock className="w-10 h-10 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.pending}</p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.accepted}</p>
                </div>
              </div>

              <div className="premium-card p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <XCircle className="w-10 h-10 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-display font-bold text-foreground">{stats.rejected}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
                {['all', 'pending', 'accepted', 'rejected', 'draft'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Offers Table */}
          <div className="premium-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Property</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">User</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Listing Price</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Offer Price</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-sm text-muted-foreground">Submitted</th>
                    <th className="text-right py-4 px-4 font-semibold text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => {
                    const statusConfig = getStatusConfig(offer.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr
                        key={offer.id}
                        className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{offer.propertyAddress}</p>
                            {(offer.propertyDetails?.beds || offer.propertyDetails?.baths) && (
                              <p className="text-sm text-muted-foreground">
                                {offer.propertyDetails.beds}bd · {offer.propertyDetails.baths}ba
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium truncate max-w-[120px]">
                            {offer.userId}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatCurrency(offer.propertyDetails?.price || 0)}
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-primary">
                          {formatCurrency(offer.offerDetails?.offerPrice || 0)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} w-fit`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(offer.submittedAt || offer.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOffer(offer)}
                            className="text-primary hover:bg-primary-light"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOffers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No offers found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-premium max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Review Offer
                </h2>
                <button
                  onClick={() => {
                    setSelectedOffer(null);
                    setReviewNotes('');
                    setReviewAction(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Offer Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-primary" />
                    Property Details
                  </h3>
                  <div className="bg-secondary rounded-xl p-4 space-y-2">
                    <p className="font-medium text-foreground">{selectedOffer.propertyAddress}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Listing Price</p>
                        <p className="font-semibold">{formatCurrency(selectedOffer.propertyDetails?.price || 0)}</p>
                      </div>
                      {selectedOffer.propertyDetails?.beds && (
                        <div>
                          <p className="text-muted-foreground">Beds / Baths</p>
                          <p className="font-semibold">
                            {selectedOffer.propertyDetails.beds} / {selectedOffer.propertyDetails.baths}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-success" />
                    Offer Details
                  </h3>
                  <div className="bg-secondary rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Offer Price</p>
                        <p className="font-semibold text-lg text-primary">
                          {formatCurrency(selectedOffer.offerDetails?.offerPrice || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deposit</p>
                        <p className="font-semibold">{formatCurrency(selectedOffer.offerDetails?.deposit || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expiry Date</p>
                        <p className="font-semibold">{formatDate(selectedOffer.offerDetails?.expiryDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Possession Date</p>
                        <p className="font-semibold">{formatDate(selectedOffer.offerDetails?.possessionDate)}</p>
                      </div>
                    </div>
                    {selectedOffer.offerDetails?.subjects && selectedOffer.offerDetails.subjects.length > 0 && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedOffer.offerDetails.subjects.map((subject, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white rounded-lg text-xs font-medium">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedOffer.offerDetails?.notes && (
                      <div>
                        <p className="text-muted-foreground text-sm mb-2">Additional Notes</p>
                        <p className="text-sm">{selectedOffer.offerDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Review Section */}
                {selectedOffer.status === 'submitted' && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                      Your Review
                    </h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your review notes here..."
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedOffer.status === 'submitted' ? (
                    <>
                      <Button
                        onClick={() => handleReviewOffer(selectedOffer.id, 'accepted', reviewNotes)}
                        className="flex-1 gradient-success text-white shadow-premium"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Offer
                      </Button>
                      <Button
                        onClick={() => handleReviewOffer(selectedOffer.id, 'rejected', reviewNotes)}
                        variant="outline"
                        className="flex-1 border-danger text-danger hover:bg-danger-light"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Offer
                      </Button>
                    </>
                  ) : (
                    <div className="w-full p-4 bg-secondary rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="font-semibold capitalize">{selectedOffer.status}</span>
                      </p>
                      {selectedOffer.adminNotes && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Admin Notes:</span> {selectedOffer.adminNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
