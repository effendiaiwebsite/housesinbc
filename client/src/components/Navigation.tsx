/**
 * Navigation Component - Premium Design
 *
 * World-class navigation inspired by CRMuiKit Neptune theme
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, MapPin, Calculator, Gift, Building2, BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/pricing', label: 'Neighborhoods', icon: MapPin },
    { href: '/mortgage', label: 'Calculator', icon: Calculator },
    { href: '/incentives', label: 'Incentives', icon: Gift },
    { href: '/properties', label: 'Properties', icon: Building2 },
    { href: '/blog', label: 'Blog', icon: BookOpen },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => location === href;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-soft-lg'
          : 'bg-white shadow-soft'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Premium Design */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center shadow-premium">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                Houses in BC
              </span>
              <span className="text-xs text-muted-foreground font-medium -mt-0.5">
                Your First Home Journey
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Premium Style */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    group relative px-4 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200 flex items-center space-x-2
                    ${isActive(link.href)
                      ? 'text-primary bg-primary-light shadow-soft'
                      : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {isActive(link.href) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-primary rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons - Premium Design */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:bg-primary-light hover:border-primary/40"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-danger-light hover:text-danger"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/client/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:bg-primary-light hover:border-primary/40"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Client Login
                  </Button>
                </Link>
                <Link href="/landing">
                  <Button
                    size="sm"
                    className="btn-premium gradient-primary text-white shadow-premium hover:shadow-premium-lg"
                  >
                    Get Free Guide
                    <Gift className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Enhanced */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Premium Design */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-white/95 backdrop-blur-lg animate-fade-in-down">
          <div className="px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium
                    transition-all duration-200
                    ${isActive(link.href)
                      ? 'bg-primary-light text-primary shadow-soft'
                      : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-primary/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-danger-light hover:text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/client/login">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-primary/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Client Login
                    </Button>
                  </Link>
                  <Link href="/landing">
                    <Button
                      className="w-full gradient-primary text-white shadow-premium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Free Guide
                      <Gift className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
