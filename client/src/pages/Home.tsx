/**
 * Home Page - Premium Design
 *
 * World-class landing page with award-winning design
 * Inspired by CRMuiKit Neptune theme
 */

import { Link } from 'wouter';
import { ArrowRight, Calculator, Home as HomeIcon, MapPin, Gift, TrendingUp, Shield, Award, Star, Phone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  const features = [
    {
      icon: Gift,
      title: 'Government Incentives',
      description: 'Access up to $40,000 in first-time buyer programs and tax credits available in BC.',
      gradient: 'gradient-success',
      iconBg: 'bg-success-light',
      iconColor: 'text-success',
      link: '/incentives',
      badge: 'Up to $40K',
    },
    {
      icon: Calculator,
      title: 'Mortgage Calculator',
      description: 'Calculate your monthly payments, affordability, and total costs with our advanced tools.',
      gradient: 'gradient-primary',
      iconBg: 'bg-primary-light',
      iconColor: 'text-primary',
      link: '/mortgage',
      badge: 'Free Tool',
    },
    {
      icon: MapPin,
      title: 'Neighborhood Guide',
      description: 'Explore BC neighborhoods with pricing data, lifestyle info, and market trends.',
      gradient: 'gradient-info',
      iconBg: 'bg-info-light',
      iconColor: 'text-info',
      link: '/pricing',
      badge: 'Live Data',
    },
  ];

  const stats = [
    { icon: Award, value: '500+', label: 'First-Time Buyers Helped', color: 'text-warning' },
    { icon: HomeIcon, value: '95%', label: 'Client Satisfaction', color: 'text-success' },
    { icon: TrendingUp, value: '$2M+', label: 'Incentives Secured', color: 'text-primary' },
    { icon: Shield, value: '10+', label: 'Years Experience', color: 'text-info' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-white to-background">
      <Navigation />

      {/* Hero Section - Premium Design */}
      <section className="relative min-h-[700px] flex items-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 animated-bg opacity-60"></div>

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          }}
        ></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft text-sm font-medium text-primary mb-4">
                <Star className="w-4 h-4 mr-2 fill-warning text-warning" />
                Trusted by 500+ First-Time Home Buyers
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
                <span className="text-foreground">Your First Home in BC</span>
                <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-hover animate-gradient bg-[length:200%_auto]">
                  Starts Here
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Discover affordable homes, government incentives, and expert guidance for first-time buyers in British Columbia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/landing">
                  <a className="group inline-flex items-center justify-center px-8 py-4 btn-premium gradient-primary text-white text-lg font-semibold rounded-xl shadow-premium hover:shadow-premium-lg transition-all hover-lift">
                    Get Your Free Guide
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
                <Link href="/mortgage">
                  <a className="group inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-secondary text-foreground text-lg font-semibold rounded-xl shadow-soft hover:shadow-soft-lg transition-all border border-border/50 hover-lift">
                    <Calculator className="w-5 h-5 mr-3" />
                    Calculate Mortgage
                  </a>
                </Link>
              </div>
            </div>

            {/* Premium Realtor Card */}
            <div className="hidden lg:block animate-fade-in-up delay-300">
              <div className="premium-card p-8 hover-lift">
                <div className="text-center space-y-6">
                  {/* Profile Image with Premium Badge */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50"></div>
                    <div className="relative">
                      <img
                        src={new URL('../assets/rida.png', import.meta.url).href}
                        alt="Rida Kazmi - BC Home Buying Expert"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-premium"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-success rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-1">
                      Rida Kazmi
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      Licensed Real Estate Professional
                    </p>
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">(500+ reviews)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-primary-light rounded-xl">
                      <div className="icon-badge-sm bg-primary text-white">
                        <Star className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">500+ First-Time Buyers Helped</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-success-light rounded-xl">
                      <div className="icon-badge-sm bg-success text-white">
                        <HomeIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">BC Market Specialist</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-warning-light rounded-xl">
                      <div className="icon-badge-sm bg-warning text-white">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Government Incentive Expert</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <a href="tel:7783205031" className="block">
                      <button className="w-full btn-premium gradient-primary text-white px-6 py-3 rounded-xl font-semibold shadow-premium hover:shadow-premium-lg transition-all">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Book Free Consultation
                      </button>
                    </a>
                    <Link href="/client/login">
                      <a className="block w-full bg-secondary hover:bg-secondary-hover text-foreground px-6 py-3 rounded-xl font-semibold transition-all border border-border/50">
                        Client Login
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Premium */}
      <section className="py-16 bg-white border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center space-y-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-background to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary-light rounded-full text-sm font-semibold text-primary mb-4">
              Complete Solution
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground">
              Everything You Need to Buy
              <span className="block text-gradient-primary mt-2">Your First Home</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Navigate BC's real estate market with confidence using our comprehensive tools and expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.link}>
                  <a className="group">
                    <div className="premium-card p-8 space-y-6 hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                      {/* Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 ${feature.iconBg} ${feature.iconColor} text-xs font-bold rounded-full`}>
                          {feature.badge}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="relative">
                        <div className={`absolute inset-0 ${feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                        <div className={`relative icon-badge ${feature.gradient} text-white shadow-premium`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Link */}
                      <div className={`flex items-center ${feature.iconColor} font-semibold group-hover:gap-3 gap-2 transition-all`}>
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Design */}
      <section className="relative py-24 overflow-hidden">
        {/* Premium Gradient Background */}
        <div className="absolute inset-0 gradient-primary"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
              Ready to Start Your Home
              <span className="block mt-2">Buying Journey?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Get instant access to our comprehensive first-time buyer's guide and start making informed decisions today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up delay-200">
            <Link href="/landing">
              <a className="group inline-flex items-center justify-center px-10 py-5 bg-white text-primary rounded-xl text-lg font-bold shadow-premium-xl hover:shadow-premium-lg hover:scale-105 transition-all">
                Download Free Guide
                <Gift className="w-5 h-5 ml-3 group-hover:rotate-12 transition-transform" />
              </a>
            </Link>
            <Link href="/incentives">
              <a className="group inline-flex items-center justify-center px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-lg font-bold border-2 border-white/30 hover:border-white/50 transition-all">
                Explore Incentives
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm pt-8 animate-fade-in-up delay-300">
            <Shield className="w-4 h-4" />
            <span>100% Free • No Credit Card Required • Instant Access</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
