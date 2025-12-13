/**
 * Admin User Detail Page - View individual user's complete journey
 *
 * Phase 6: Task 6.2 - View milestone progress in detail
 * Phase 6: Task 6.3 - View rate preferences
 * Phase 6: Task 6.4 - Review uploaded documents
 */

import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft, User, DollarSign, Home, TrendingUp, Calendar,
  CheckCircle2, Clock, Lock, PlayCircle, Download, FileText,
  CreditCard, PiggyBank, Gift, MapPin, Eye, FileCheck, Percent
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Navigation from '../components/Navigation';
import AdminSidebar from '../components/AdminSidebar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/useToast';

interface MilestoneConfig {
  id: string;
  title: string;
  icon: any;
  description: string;
}

const MILESTONES: MilestoneConfig[] = [
  { id: 'step1_creditScore', title: 'Check Credit Score', icon: CreditCard, description: 'Credit report and borrowing power' },
  { id: 'step2_fhsa', title: 'Open FHSA Account', icon: PiggyBank, description: 'Tax-free savings account' },
  { id: 'step3_preApproval', title: 'Get Pre-Approved', icon: FileCheck, description: 'Compare rates from 10+ lenders' },
  { id: 'step4_incentives', title: 'BC Incentives', icon: Gift, description: 'PTT exemption, GST rebate, FHSA benefits' },
  { id: 'step5_neighborhoods', title: 'Explore Neighborhoods', icon: MapPin, description: 'Surrey hotspots' },
  { id: 'step6_searchProperties', title: 'Search Properties', icon: Home, description: 'Browse live MLS listings' },
  { id: 'step7_bookViewing', title: 'Book Viewings', icon: Calendar, description: 'Schedule property tours' },
  { id: 'step8_makeOffer', title: 'Make an Offer', icon: FileText, description: 'Submit offer for review' },
];

export default function AdminUserDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const userId = params.userId;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [ratePreferences, setRatePreferences] = useState<any[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setLocation('/admin/login');
      return;
    }

    if (userId) {
      loadUserData();
    }
  }, [isAuthenticated, user, userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load quiz response
      const quizResponse = await fetch(`/api/quiz/response/${userId}`, {
        credentials: 'include',
      });

      if (quizResponse.ok) {
        const quizJson = await quizResponse.json();
        setQuizData(quizJson.data);
      }

      // Load progress data
      const progressResponse = await fetch(`/api/progress/${userId}`, {
        credentials: 'include',
      });

      if (progressResponse.ok) {
        const progressJson = await progressResponse.json();
        setProgressData(progressJson.data);

        // Extract rate preferences and documents from step 3 if available
        const step3Data = progressJson.data?.milestones?.step3_preApproval?.data;
        if (step3Data?.ratePreferences) {
          setRatePreferences(step3Data.ratePreferences);
        }
        if (step3Data?.documentsUploaded) {
          setUploadedDocuments(step3Data.documentsUploaded);
        }
      }

      // Load offers
      const offersResponse = await fetch(`/api/offers/${userId}`, {
        credentials: 'include',
      });

      if (offersResponse.ok) {
        const offersJson = await offersResponse.json();
        setOffers(offersJson.data || []);
      }

    } catch (error: any) {
      console.error('Load user data error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getMilestoneStatus = (milestoneId: string) => {
    if (!progressData?.milestones) return 'pending';
    return progressData.milestones[milestoneId]?.status || 'pending';
  };

  const getMilestoneData = (milestoneId: string) => {
    if (!progressData?.milestones) return {};
    return progressData.milestones[milestoneId]?.data || {};
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-warning" />;
      case 'available': return <PlayCircle className="w-5 h-5 text-primary" />;
      default: return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-light text-success';
      case 'in_progress': return 'bg-warning-light text-warning';
      case 'available': return 'bg-primary-light text-primary';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium text-foreground">User not found</p>
          <Button onClick={() => setLocation('/admin/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/users')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                  User Journey Details
                </h1>
                <p className="text-lg text-muted-foreground">
                  {quizData.userId || quizData.sessionId}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-xl ${
                progressData?.overallProgress === 100 ? 'bg-success-light text-success' : 'bg-primary-light text-primary'
              } font-semibold text-lg`}>
                {progressData?.overallProgress?.toFixed(0) || 0}% Complete
              </div>
            </div>
          </div>

          {/* Quiz Response Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="icon-badge gradient-primary text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Income</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatCurrency(quizData.income)}
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="icon-badge gradient-success text-white">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Savings</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatCurrency(quizData.savings)}
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="icon-badge gradient-warning text-white">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Affordability</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatCurrency(quizData.calculatedAffordability)}
                  </p>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="icon-badge gradient-info text-white">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Incentives</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {formatCurrency(quizData.calculatedIncentives?.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="premium-card p-6 mb-10">
            <h3 className="text-2xl font-display font-bold text-foreground mb-6">
              Milestone Progress
            </h3>
            <div className="space-y-4">
              {MILESTONES.map((milestone, index) => {
                const Icon = milestone.icon;
                const status = getMilestoneStatus(milestone.id);
                const data = getMilestoneData(milestone.id);

                return (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-5 border border-border rounded-xl hover:shadow-soft transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-grow">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        status === 'completed' ? 'bg-success-light text-success' :
                        status === 'in_progress' ? 'bg-warning-light text-warning' :
                        status === 'available' ? 'bg-primary-light text-primary' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-semibold text-foreground">
                            {index + 1}. {milestone.title}
                          </p>
                          {getStatusIcon(status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        {Object.keys(data).length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <pre className="bg-secondary p-2 rounded overflow-x-auto max-w-md">
                              {JSON.stringify(data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${getStatusColor(status)}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rate Preferences (6.3) */}
          {ratePreferences.length > 0 && (
            <div className="premium-card p-6 mb-10">
              <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center">
                <Percent className="w-6 h-6 mr-2 text-primary" />
                Rate Preferences
              </h3>
              <div className="space-y-4">
                {ratePreferences.map((rate, index) => (
                  <div key={index} className="p-5 border border-border rounded-xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Lender</p>
                        <p className="font-semibold text-foreground">{rate.lender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold text-foreground capitalize">{rate.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Advertised Rate</p>
                        <p className="font-semibold text-foreground">{(rate.advertisedRate * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Personalized Rate</p>
                        <p className="font-semibold text-success">{(rate.personalizedRate * 100).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="font-semibold text-foreground">{formatCurrency(rate.monthlyPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stress Test Payment</p>
                        <p className="font-semibold text-warning">{formatCurrency(rate.stressTestPayment)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Approval Odds</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          rate.approvalOdds === 'high' ? 'bg-success-light text-success' :
                          rate.approvalOdds === 'medium' ? 'bg-warning-light text-warning' :
                          'bg-danger-light text-danger'
                        }`}>
                          {rate.approvalOdds}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents (6.4) */}
          {uploadedDocuments.length > 0 && (
            <div className="premium-card p-6 mb-10">
              <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center">
                <Download className="w-6 h-6 mr-2 text-primary" />
                Uploaded Documents
              </h3>
              <div className="space-y-3">
                {uploadedDocuments.map((doc, index) => (
                  <div key={index} className="p-4 border border-border rounded-xl hover:border-primary transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <FileText className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{doc.fileName}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                            <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                            {doc.uploadedAt && (
                              <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={doc.downloadURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offers */}
          {offers.length > 0 && (
            <div className="premium-card p-6">
              <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-primary" />
                Submitted Offers
              </h3>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-5 border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-foreground text-lg">{offer.propertyAddress}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {formatDate(offer.submittedAt || offer.createdAt)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize ${
                        offer.status === 'accepted' ? 'bg-success-light text-success' :
                        offer.status === 'rejected' ? 'bg-danger-light text-danger' :
                        offer.status === 'submitted' ? 'bg-warning-light text-warning' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Listing Price</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(offer.propertyDetails?.price || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Offer Price</p>
                        <p className="font-semibold text-primary">
                          {formatCurrency(offer.offerDetails?.offerPrice || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deposit</p>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(offer.offerDetails?.deposit || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subjects</p>
                        <p className="text-sm text-foreground">
                          {offer.offerDetails?.subjects?.length || 0} conditions
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
