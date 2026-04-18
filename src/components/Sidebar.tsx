'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  ActivityIcon,
  Banknote,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  Clock,
  Contact,
  CreditCard,
  Database,
  FileText,
  IndianRupee,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  PieChart,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Truck,
  UserPlus,
  Users,
  Users2,
  Wallet,
  Wrench,
  Building2,
  HardHat,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type SubMenuItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
  subItems?: SubMenuItem[];
};

type MenuItem = {
  name: string;
  icon?: LucideIcon;
  href?: string;
  subItems?: SubMenuItem[];
  noCollapse?: boolean;
};

export const Sidebar = () => {
  const { logout, can } = useAuth();
  const pathname = usePathname();

  const isOpen = true; // Sidebar permanently open per user request
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);

  const menuItems: MenuItem[] = useMemo(() => [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/',
    },

    // CRM Module
    (can('sales', 'view') || can('quote_track', 'view')) && {
      name: 'CRM',
      icon: Users2,
      noCollapse: true,
      subItems: [
        can('sales', 'view') && {
          name: 'Leads',
          icon: UserPlus,
          href: '/sales',
        },
        can('quote_track', 'view') && {
          name: 'Quote Tracking',
          icon: FileText,
          href: '/quote-track',
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Finance Module
    (can('accounts', 'view') || can('ledger', 'view') || can('expense', 'view') || can('invoice', 'view') || can('payment', 'view')) && {
      name: 'Finance',
      icon: IndianRupee,
      noCollapse: true,
      subItems: [
        can('accounts', 'view') && { name: 'Accounts', icon: BookOpen, href: '/finance/accounts' },
        can('ledger', 'view') && { name: 'Ledger', icon: Database, href: '/finance/ledger' },
        can('expense', 'view') && { name: 'Expenses', icon: Wallet, href: '/finance/expenses' },
        can('invoice', 'view') && { name: 'Invoices', icon: FileText, href: '/finance/invoices' },
        can('payment', 'view') && { name: 'Payment', icon: CreditCard, href: '/finance/payment' },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Inventory Module
    (can('inventory', 'view') || can('delivery_ticket', 'view') || can('return_ticket', 'view') || can('product', 'view') || can('running_order', 'view')) && {
      name: 'Inventory',
      icon: Package,
      noCollapse: true,
      subItems: [
        can('product', 'view') && {
          name: 'Products Catalog',
          icon: Box,
          href: '/master/catalog',
        },
        can('inventory', 'view') && {
          name: 'Stock Status',
          icon: Layers,
          href: '/inventory',
        },
        can('delivery_ticket', 'view') && {
          name: 'Delivery Challan',
          icon: Truck,
          href: '/delivery-ticket',
        },
        can('return_ticket', 'view') && {
          name: 'Return Records',
          icon: RotateCcw,
          href: '/return-ticket',
        },
        can('running_order', 'view') && {
          name: 'Running Order',
          icon: ActivityIcon,
          href: '/running-order',
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // HR & Payroll Module
    (can('user', 'view') || can('attendance', 'view')) && {
      name: 'HR & Payroll',
      icon: Contact,
      subItems: [
        can('user', 'view') && {
          name: 'Employee',
          icon: Users,
          href: '/users',
        },
        can('attendance', 'view') && {
          name: 'Attendance',
          icon: Clock,
          href: '/attendance',
        },
        can('payroll', 'view') && {
          name: 'Payroll',
          icon: Banknote,
          href: '/hr/payroll',
          subItems: [
            { name: 'Salary Breakups', icon: PieChart, href: '/hr/payroll/breakups' },
            { name: 'Salary Slips', icon: ReceiptText, href: '/hr/payroll/slips' },
          ]
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Admin / Master
    (can('role', 'view') || can('customer', 'view') || can('vendor', 'view') || can('user', 'view')) && {
      name: 'Administration',
      icon: ShieldCheck,
      subItems: [
        can('role', 'view') && { name: 'Roles & Permissions', href: '/roles' },
        can('customer', 'view') && { name: 'Customers Master', href: '/master/customer' },
        can('vendor', 'view') && { name: 'Vendors Master', href: '/master/vendor' },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Fleet & Mechanical Module
    can('fleet', 'view') && {
      name: 'Fleet & Workshop',
      icon: Truck,
      subItems: [
        can('fleet', 'view') && {
          name: 'Vehicle Registry',
          icon: Truck,
          href: '/fleet',
        },
        can('fleet', 'view') && {
          name: 'Mechanical Checkup',
          icon: Wrench,
          href: '/fleet/mechanical',
        },
        can('fleet', 'view') && {
          name: 'Workshop Reports',
          icon: FileText,
          href: '/fleet/reports',
        },
      ].filter(Boolean) as SubMenuItem[],
    },
 
    // Facility & Workforce Module
    (can('facility', 'view') || can('worker', 'view')) && {
      name: 'Facility & Workforce',
      icon: Building2,
      subItems: [
        can('facility', 'view') && {
          name: 'Offices & Camps',
          icon: Building2,
          href: '/facilities',
        },
        can('facility', 'view') && {
          name: 'Facility Audits',
          icon: ClipboardCheck,
          href: '/facilities/checklist',
        },
        can('worker', 'view') && {
          name: 'Labor Management',
          icon: HardHat,
          href: '/workers',
        },
      ].filter(Boolean) as SubMenuItem[],
    },

  ].filter(Boolean) as MenuItem[], [can]);

  useEffect(() => {
    const findAndOpenSubMenus = (items: (MenuItem | SubMenuItem)[], currentPath: string): boolean => {
      for (const item of items) {
        // Precise matching for the auto-open check
        const itemHref = item.href;
        const isMatch = itemHref && (itemHref === '/' ? currentPath === '/' : (currentPath === itemHref || currentPath.startsWith(itemHref + '/')));

        if (isMatch) return true;

        if (item.subItems) {
          const isChildActive = findAndOpenSubMenus(item.subItems, currentPath);
          if (isChildActive) {
            setOpenSubMenus(prev => Array.from(new Set([...prev, item.name])));
            return true;
          }
        }
      }
      return false;
    };
    findAndOpenSubMenus(menuItems, pathname);
  }, [pathname, menuItems]);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenus(prev => (prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]));
  };

  const renderSubItem = (sub: SubMenuItem | MenuItem, siblings: (SubMenuItem | MenuItem)[] = []) => {
    // Precise path matching: exact match OR sub-route match (e.g. /users/add)
    // We only match a sub-route if it doesn't match a more specific sibling
    const isRouteActive = pathname === sub.href || (
      !!sub.href && 
      pathname.startsWith(sub.href + '/') && 
      !siblings.some(other => other.href !== sub.href && other.href && pathname.startsWith(other.href))
    );
    const hasChildren = sub.subItems && sub.subItems.length > 0;
    const isExpanded = openSubMenus.includes(sub.name);

    return (
      <div key={sub.name} className="flex flex-col">
        {hasChildren ? (
          <button
            onClick={() => toggleSubMenu(sub.name)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300
              ${isExpanded ? 'text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full ${isRouteActive ? 'bg-[#14b8a6]' : 'bg-gray-500'}`} />
              {sub.name}
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <Link
            href={sub.href || '#'}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300
              ${isRouteActive ? 'bg-[#0f766e] text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
          >
            <span className={`w-1 h-1 rounded-full ${isRouteActive ? 'bg-[#14b8a6]' : 'bg-gray-500'}`} />
            <span>{sub.name}</span>
          </Link>
        )}
        {hasChildren && isExpanded && (
          <div className="ml-4 pl-2 border-l border-white/10 mt-1 space-y-1">
            {sub.subItems!.map(child => renderSubItem(child, sub.subItems))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${isOpen ? 'w-80' : 'w-24'} h-screen fixed md:relative z-50 flex flex-col transition-all duration-500
      bg-[#0f172a] text-white shadow-2xl overflow-hidden`}
    >
      {/* BRANDING SECTION */}
      <Link href="/" className="block">
        <div className={`relative px-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md h-20 transition-all duration-500`}>
          <div className="transition-all duration-500 transform opacity-100 scale-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Image src="/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="space-y-6">
          {menuItems.map((item) => {
            const ItemIcon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = openSubMenus.includes(item.name);
            const isChildActive = item.subItems?.some(sub =>
              pathname === sub.href ||
              pathname.startsWith(sub.href + '/') ||
              sub.subItems?.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
            );
            const isDirectActive = item.href === '/' ? pathname === '/' : (item.href && (pathname === item.href || pathname.startsWith(item.href + '/')));

            // isRouteActive determines if the module should have the active background highlight
            const isRouteActive = isChildActive || isDirectActive;

            if (item.noCollapse && hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  {isOpen && <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-2">{item.name}</p>}
                  {item.subItems!.map(sub => {
                    const SubIcon = sub.icon || Box;
                    const isSubRouteActive = pathname === sub.href || (pathname.startsWith(sub.href + '/') && !item.subItems!.some(other => other.href !== sub.href && other.href && pathname.startsWith(other.href)));
                    return (
                      <Link
                        key={sub.name}
                        href={sub.href || '#'}
                        className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                          ${isSubRouteActive && isOpen ? 'bg-[#0f766e] text-white shadow-xl' : 'hover:bg-white/10 text-gray-200'}`}
                      >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isSubRouteActive ? 'bg-[#14b8a6] text-white shadow-md' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                          <SubIcon size={18} />
                        </div>
                        {isOpen && <span className="text-[14px] font-bold">{sub.name}</span>}
                      </Link>
                    )
                  })}
                </div>
              );
            }

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  {isOpen && <p className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{item.name}</p>}
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300
                      ${isRouteActive && isOpen ? 'bg-[#0f766e] text-white shadow-lg' : 'hover:bg-white/10 text-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-all duration-300 ${isRouteActive ? 'bg-[#14b8a6] text-white shadow-md' : 'bg-white/10 text-gray-200 group-hover:bg-white/20'}`}>
                        {ItemIcon && <ItemIcon size={18} />}
                      </div>
                      {isOpen && <span className="text-[14px] font-bold">{item.name}</span>}
                    </div>
                    {isOpen && <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />}
                  </button>
                  {isExpanded && isOpen && (
                    <div className="mt-2 ml-4 flex flex-col gap-1 border-l border-white/10 pl-2 animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.subItems!.map(sub => renderSubItem(sub, item.subItems))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href || '#'}
                className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                  ${isRouteActive && isOpen ? 'bg-[#0f766e] text-white shadow-xl' : 'hover:bg-white/10 text-gray-200'}`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${isRouteActive ? 'bg-[#14b8a6] text-white shadow-md' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                  {ItemIcon && <ItemIcon size={18} />}
                </div>
                {isOpen && <span className="text-[14px] font-bold">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-3xl">
        <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0f766e] hover:bg-[#134e4a] text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
          <LogOut size={18} />
          {isOpen && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
