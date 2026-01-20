import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface SubItem {
  name: string;
  path: string;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  roles?: string[];
  subItems?: SubItem[];
}

interface NavItemProps {
  item: NavigationItem;
  isMobile?: boolean;
}

const Navigation = () => {
  const params = useParams();
  const farmId = params.farmId;
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);



  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [];

        // Only show Dashboard if farmer has selected a farm or is not a farmer
    if (user?.role !== 'farmer' || farmId) {
      baseItems.push({
        name: 'Dashboard',
        path: farmId ? `/farms/${farmId}/dashboard` : '/dashboard',
        icon: 'fas fa-home',
        roles: ['admin', 'farmer', 'worker', 'veterinarian', 'loan_officer']
      });
    }

    const roleBasedItems = {
      admin: [
        {
          name: 'User Management',
          path: '/users',
          icon: 'fas fa-users',
          subItems: [
            { name: 'All Users', path: '/users' },
            { name: 'Add User', path: '/users/add' },
            { name: 'Roles & Permissions', path: '/users/roles' }
          ]
        },
        {
          name: 'System Settings',
          path: '/settings',
          icon: 'fas fa-cog',
          subItems: [
            { name: 'General Settings', path: '/settings/general' },
            { name: 'Security', path: '/settings/security' },
            { name: 'Backup & Restore', path: '/settings/backup' }
          ]
        }
      ],
      farmer: [
         {
      name: 'Farms',
      path: '/farms',
      icon: 'fas fa-barn',
      subItems: farmId ? [
        { name: 'My Farms', path: '/farms' },
        { name: 'Add Farm', path: '/farms/add' },
        { name: 'Select Farm', path: '/select/farm' }
      ] : [
            { name: 'View Farms', path: '/farms' },
            { name: 'Add Farm', path: '/farms/add' },
            { name: 'Select Farm', path: '/select/farm' }
      ]
    },
        ...(farmId ? [
          {
            name: 'Livestock',
            path: `/farms/${farmId}/livestock`,
            icon: 'fas fa-cow',
            subItems: [
              { name: 'All Livestock', path: `/farms/${farmId}/livestock` },
              { name: 'Add Animal', path: `/farms/${farmId}/livestock/add` },
              { name: 'Breeding Records', path: `/farms/${farmId}/livestock/breeding` }
            ]
          },
          {
            name: 'Health',
            path: `/farms/${farmId}/health`,
            icon: 'fas fa-heartbeat',
            subItems: [
              { name: 'Health Records', path: `/farms/${farmId}/health/records` },
              { name: 'Vaccinations', path: `/vaccinations` },
              { name: 'Treatments', path: `/treatment-schedules` },
              { name: 'Sick Animals', path: `/farms/${farmId}/animals/sick` },
              { name: 'Disease Surveillance', path: `/farms/${farmId}/health/surveillance` }
            ]
          },
          {
            name: 'Feeding',
            path: `/farms/${farmId}/feeding`,
            icon: 'fas fa-utensils',
            subItems: [
              { name: 'Feeding Schedule', path: `/farms/${farmId}/feeding/schedule` },
              { name: 'Feed Inventory', path: `/farms/${farmId}/feeding/inventory` },
              { name: 'Nutrition Calculator', path: `/farms/${farmId}/feeding/calculator` },
              { name: 'Cost Tracker', path: `/farms/${farmId}/feeding/costs` }
            ]
          },
          {
            name: 'Financial',
            path: `/farms/${farmId}/financial`,
            icon: 'fas fa-money-bill-wave',
            subItems: [
              { name: 'Overview', path: `/farms/${farmId}/financial` },
              { name: 'Revenues', path: `/farms/${farmId}/revenues` },
              { name: 'Expenses', path: `/farms/${farmId}/expenses` },
              { name: 'ROI Analysis', path: `/farms/${farmId}/financial/roi` },
              { name: 'Loan Management', path: `/farms/${farmId}/financial/loans` },
              { name: 'Recommendations', path: `/farms/${farmId}/financial/recommendations` }
            ]
          },
          {
            name: 'Reports',
            path: `/farms/${farmId}/reports`,
            icon: 'fas fa-chart-bar',
            subItems: [
              { name: 'Dashboard Analytics', path: `/farms/${farmId}/reports/analytics` },
              { name: 'Export Tools', path: `/farms/${farmId}/reports/export` },
              { name: 'Trend Analysis', path: `/farms/${farmId}/reports/trends` },
              { name: 'Report Generator', path: `/farms/${farmId}/reports/generator` }
            ]
          }        
        ] : [])
      ],
      worker: [
        {
          name: 'Tasks',
          path: '/tasks',
          icon: 'fas fa-tasks',
          subItems: [
            { name: 'My Tasks', path: '/tasks/manager' },
            { name: 'Daily Schedule', path: '/tasks/schedule' },
            { name: 'Calendar View', path: '/tasks/calendar' },
            { name: 'Performance Tracking', path: '/tasks/performance' }
          ]
        },
        {
          name: 'Livestock Care',
          path: '/livestock',
          icon: 'fas fa-cow',
          subItems: [
            { name: 'Animal List', path: '/livestock' },
            { name: 'Feeding Schedule', path: '/feeding/schedule' },
            { name: 'Health Alerts', path: '/health/alerts' }
          ]
        }
      ],
      veterinarian: [
        {
          name: 'Health Management',
          path: '/health',
          icon: 'fas fa-stethoscope',
          subItems: [
            { name: 'Health Records', path: '/health/records' },
            { name: 'Vaccinations', path: '/health/vaccinations' },
            { name: 'Treatments', path: '/health/treatments' },
            { name: 'Disease Surveillance', path: '/health/surveillance' }
          ]
        },
        {
          name: 'Appointments',
          path: '/appointments',
          icon: 'fas fa-calendar-alt',
          subItems: [
            { name: 'Today\'s Appointments', path: '/appointments/today' },
            { name: 'Schedule', path: '/appointments/schedule' },
            { name: 'History', path: '/appointments/history' }
          ]
        }
      ],
      loan_officer: [
        {
          name: 'Loan Management',
          path: '/loans',
          icon: 'fas fa-hand-holding-usd',
          subItems: [
            { name: 'Active Loans', path: '/loans/active' },
            { name: 'Applications', path: '/loans/applications' },
            { name: 'Repayment Tracking', path: '/loans/repayments' }
          ]
        },
        {
          name: 'Financial Assessment',
          path: '/assessment',
          icon: 'fas fa-calculator',
          subItems: [
            { name: 'Credit Analysis', path: '/assessment/credit' },
            { name: 'Risk Assessment', path: '/assessment/risk' },
            { name: 'Portfolio Overview', path: '/assessment/portfolio' }
          ]
        }
      ]
    };

    const userRole = (user?.role || 'farmer') as keyof typeof roleBasedItems;
    const userItems = roleBasedItems[userRole] || roleBasedItems.farmer;
    
    return [...baseItems, ...userItems];
  };

  const navigationItems = getNavigationItems();

  // Quick actions based on user role
  const getQuickActions = () => {
    const userRole = (user?.role || 'farmer') as keyof typeof quickActions;
    
    const quickActions = {
      admin: [
        { name: 'Add User', path: '/users/add', icon: 'fas fa-user-plus', color: 'bg-blue-500' },
        { name: 'System Backup', path: '/settings/backup', icon: 'fas fa-download', color: 'bg-green-500' },
        { name: 'View Reports', path: '/reports', icon: 'fas fa-chart-line', color: 'bg-purple-500' }
      ],
      farmer:farmId ? [
        { name: 'Add Animal', path: `/farms/${farmId}/livestock/add`, icon: 'fas fa-plus', color: 'bg-green-500' },
        { name: 'Record Expense', path: `/farms/${farmId}/financial/expenses`, icon: 'fas fa-receipt', color: 'bg-red-500' },
        { name: 'Health Check', path: `/farms/${farmId}/health/records`, icon: 'fas fa-heartbeat', color: 'bg-pink-500' },
        { name: 'Feed Schedule', path: `/farms/${farmId}/feeding/schedule`, icon: 'fas fa-utensils', color: 'bg-orange-500' }
      ] : [
        { name: 'Add Farm', path: '/farms/add', icon: 'fas fa-plus', color: 'bg-green-500' },
        { name: 'View Farms', path: '/farms', icon: 'fas fa-barn', color: 'bg-blue-500' }
      ],
      worker: [
        { name: 'View Tasks', path: '/tasks', icon: 'fas fa-clipboard-list', color: 'bg-blue-500' },
        { name: 'Feed Animals', path: '/feeding/schedule', icon: 'fas fa-utensils', color: 'bg-orange-500' },
        { name: 'Report Issue', path: '/health/alerts', icon: 'fas fa-exclamation-triangle', color: 'bg-yellow-500' }
      ],
      veterinarian: [
        { name: 'New Treatment', path: '/health/treatments', icon: 'fas fa-syringe', color: 'bg-red-500' },
        { name: 'Schedule Visit', path: '/appointments/schedule', icon: 'fas fa-calendar-plus', color: 'bg-blue-500' },
        { name: 'Health Report', path: '/health/reports', icon: 'fas fa-file-medical', color: 'bg-green-500' }
      ],
      loan_officer: [
        { name: 'New Application', path: '/loans/applications', icon: 'fas fa-file-invoice-dollar', color: 'bg-green-500' },
        { name: 'Credit Check', path: '/assessment/credit', icon: 'fas fa-search-dollar', color: 'bg-blue-500' },
        { name: 'Portfolio Review', path: '/assessment/portfolio', icon: 'fas fa-chart-pie', color: 'bg-purple-500' }
      ]
    };

    return quickActions[userRole] || quickActions.farmer;
  };

  const quickActions = getQuickActions();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const NavItem = ({ item, isMobile = false }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = isActiveRoute(item.path);

    return (
      <div className={`relative ${isMobile ? 'block' : 'inline-block'}`}>
        {hasSubItems ? (
          <div className="group">
            <button
              onClick={() => isMobile && setIsOpen(!isOpen)}
              onMouseEnter={() => !isMobile && setIsOpen(true)}
              onMouseLeave={() => !isMobile && setIsOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } ${isMobile ? 'w-full justify-between' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </div>
              <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            <div
              className={`${
                isMobile
                  ? `mt-1 ml-4 space-y-1 ${isOpen ? 'block' : 'hidden'}`
                  : `absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 ${
                      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    } transition-all duration-200`
              }`}
              onMouseEnter={() => !isMobile && setIsOpen(true)}
              onMouseLeave={() => !isMobile && setIsOpen(false)}
            >
              {item.subItems?.map((subItem: SubItem) => (
                <Link
                  key={subItem.path}
                  to={subItem.path}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                    isActiveRoute(subItem.path)
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link
            to={item.path}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } ${isMobile ? 'w-full' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-gradient-to-r from-green-50 to-white shadow-md border-b border-green-100 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <Link to={user?.role === 'farmer' ? '/farms' : '/dashboard'} className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <img src="/favicon.ico" alt="WANFAM" className="h-7 w-7" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">WANFAM</h1>
            <p className="text-xs text-gray-600 font-medium">Livestock Management</p>
          </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-2">
          {navigationItems.map((item) => (
          <NavItem key={item.path} item={item} />
          ))}
        </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
              </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1 max-h-96 overflow-y-auto">
              {navigationItems.map((item) => (
                <NavItem key={item.path} item={item} isMobile={true} />
              ))}
              
              {/* Mobile Quick Actions */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                <div className="space-y-1">
                  {quickActions.map((action) => (
                    <Link
                      key={action.path}
                      to={action.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <div className={`w-6 h-6 ${action.color} rounded-full flex items-center justify-center mr-3`}>
                        <i className={`${action.icon} text-white text-xs`}></i>
                      </div>
                      {action.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200 flex flex-row justify-around">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm">
            <Link to="/dashboard" className="text-green-600 hover:text-green-700">
              <i className="fas fa-home"></i>
            </Link>
            <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
            {location.pathname.split('/').filter(Boolean).map((segment, index, array) => {
              const path = '/' + array.slice(0, index + 1).join('/');
              const isLast = index === array.length - 1;
              const displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
              
              return (
                <React.Fragment key={path}>
                  {isLast ? (
                    <span className="text-gray-500 capitalize">{displayName}</span>
                  ) : (
                    <>
                      <Link to={path} className="text-green-600 hover:text-green-700 capitalize">
                        {displayName}
                      </Link>
                      <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {/* Right Side Icons */}
        <div className="flex items-center space-x-3 mr-10">
          {/* Quick Actions Dropdown */}
          <div className="hidden md:block relative group">
          <button className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md">
            <i className="fas fa-plus-circle text-xl"></i>
          </button>
          <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2">
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <i className="fas fa-bolt text-green-600 mr-2"></i>
              Quick Actions
            </h3>
            </div>
            <div className="py-2 max-h-80 overflow-y-auto">
            {quickActions.map((action, index) => (
              <Link
              key={action.path}
              to={action.path}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group/item"
              style={{ animationDelay: `${index * 50}ms` }}
              >
              <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mr-3 shadow-md group-hover/item:shadow-lg group-hover/item:scale-110 transition-all duration-200`}>
                <i className={`${action.icon} text-white`}></i>
              </div>
              <span className="font-medium">{action.name}</span>
              </Link>
            ))}
            </div>
          </div>
          </div>

          {/* Notifications */}
          <NotificationBell />
           
         {/* User Profile */}
          <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:shadow-md group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
            <span className="text-white text-sm font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            </div>
            <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-900">{user?.firstName || 'User'}</p>
            <p className="text-xs text-gray-600 capitalize font-medium">{user?.role || 'farmer'}</p>
            </div>
            <i className="fas fa-chevron-down text-xs group-hover:rotate-180 transition-transform duration-200"></i>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
              <p className="text-sm font-semibold text-gray-900">{user?.firstName || ' '} {user?.lastName || 'User'}</p>
              <p className="text-xs text-gray-600 mt-1">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="py-2">
              <Link
              to="/profile"
              onClick={() => setIsProfileDropdownOpen(false)}
              className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group"
              >
              <i className="fas fa-user-circle mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200"></i>
              <span className="font-medium">Profile Settings</span>
              </Link>
              <Link
              to="/change-password"
              onClick={() => setIsProfileDropdownOpen(false)}
              className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group"
              >
              <i className="fas fa-lock mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200"></i>
              <span className="font-medium">Change Password</span>
              </Link>
              <Link
              to="/settings"
              onClick={() => setIsProfileDropdownOpen(false)}
              className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group"
              >
              <i className="fas fa-cog mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200"></i>
              <span className="font-medium">Preferences</span>
              </Link>
              <Link
              to="/help"
              onClick={() => setIsProfileDropdownOpen(false)}
              className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200 group"
              >
              <i className="fas fa-question-circle mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200"></i>
              <span className="font-medium">Help & Support</span>
              </Link>
              <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 group"
              >
                <i className="fas fa-sign-out-alt mr-3 group-hover:scale-110 transition-transform duration-200"></i>
                <span className="font-medium">Sign Out</span>
              </button>
              </div>
            </div>
            </div>
          )}
          </div>
      </div>
      </div> 
    </>
  );
};

export default Navigation;
    