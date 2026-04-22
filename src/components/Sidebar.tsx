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
  Calendar,
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

    // Sales & CRM Module
    can('sales', 'view') && {
      name: 'Sales & CRM',
      icon: Users2,
      subItems: [
        {
          name: 'Leads',
          icon: UserPlus,
          href: '/sales',
        },
      ],
    },

    // Inventory & Logistics Module
    (can('inventory', 'view') || can('delivery_ticket', 'view') || can('return_ticket', 'view') || can('product', 'view') || can('running_order', 'view')) && {
      name: 'Inventory & Logistics',
      icon: Package,
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

    // Finance & Accounts Module
    (can('accounts', 'view') || can('ledger', 'view') || can('expense', 'view')  || can('payment', 'view')) && {
      name: 'Finance & Accounts',
      icon: IndianRupee,
      subItems: [
        can('accounts', 'view') && { name: 'Accounts Dashboard', icon: BookOpen, href: '/finance/accounts' },
        can('ledger', 'view') && { name: 'Ledger', icon: Database, href: '/finance/ledger' },
        can('expense', 'view') && { name: 'Expenses', icon: Wallet, href: '/finance/expenses' },
        can('payment', 'view') && { name: 'Payments & Collections', icon: CreditCard, href: '/finance/payment' },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Production & Factory Module
    can('production', 'view') && {
      name: 'Production & Factory',
      icon: Building2,
      subItems: [
        {
          name: 'Production Reports',
          icon: FileText,
          href: '/production/factory',
        },
        {
          name: 'Raw Material Registry',
          icon: Layers,
          href: '/production/raw-materials',
        },
        {
          name: 'Raw Material Stock',
          icon: Package,
          href: '/production/raw-materials/stock',
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // HR & Workforce Module
    (can('user', 'view') || can('worker', 'view') || can('attendance', 'view') || can('leave', 'view') || can('payroll', 'view')) && {
      name: 'HR & Workforce',
      icon: Users,
      subItems: [
        can('user', 'view') && {
          name: 'Employee Management',
          icon: Contact,
          href: '/users',
        },
        can('worker', 'view') && {
          name: 'Labor Management',
          icon: HardHat,
          href: '/workers',
        },
        can('attendance', 'view') && {
          name: 'Attendance Hub',
          icon: Clock,
          href: '/attendance',
        },
        can('leave', 'view') && {
          name: 'Labor Leaves',
          icon: Calendar,
          href: '/workers/leaves',
        },
        can('payroll', 'view') && {
          name: 'Payroll & Salary',
          icon: Banknote,
          href: '/hr/payroll',
          subItems: [
            { name: 'Salary Breakups', icon: PieChart, href: '/hr/payroll/breakups' },
            { name: 'Salary Slips', icon: ReceiptText, href: '/hr/payroll/slips' },
          ]
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Operations & Fleet Module
    can('fleet', 'view') && {
      name: 'Operations & Fleet',
      icon: Truck,
      subItems: [
        {
          name: 'Vehicle Registry',
          icon: Truck,
          href: '/fleet',
        },
        {
          name: 'Mechanical Checkup',
          icon: Wrench,
          href: '/fleet/mechanical',
        },
        {
          name: 'Workshop Reports',
          icon: FileText,
          href: '/fleet/reports',
        },
      ].filter(Boolean) as SubMenuItem[],
    },

    // Administration Module
    (can('role', 'view') || can('customer', 'view') || can('vendor', 'view') || can('facility', 'view')) && {
      name: 'Administration',
      icon: ShieldCheck,
      subItems: [
        can('role', 'view') && { name: 'Roles & Permissions', icon: ShieldCheck, href: '/roles' },
        can('customer', 'view') && { name: 'Customers Master', icon: Users2, href: '/master/customer' },
        can('vendor', 'view') && { name: 'Vendors Master', icon: Building2, href: '/master/vendor' },
        can('utility', 'view') && { name: 'Utility & Safety Master', icon: Package, href: '/master/utilities' },
        can('facility', 'view') && { name: 'Offices & Camps', icon: Building2, href: '/facilities' },
        can('facility', 'view') && { name: 'Facility Audits', icon: ClipboardCheck, href: '/facilities/checklist' },
      ].filter(Boolean) as SubMenuItem[],
    },

  ].filter(Boolean) as MenuItem[], [can]);

  useEffect(() => {
    const findAndOpenSubMenus = (items: (MenuItem | SubMenuItem)[], currentPath: string): boolean => {
      for (const item of items) {
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
    const isRouteActive = pathname === sub.href || (
      !!sub.href && 
      pathname.startsWith(sub.href + '/') && 
      !siblings.some(other => other.href !== sub.href && other.href && pathname.startsWith(other.href))
    );
    const hasChildren = sub.subItems && sub.subItems.length > 0;
    const isExpanded = openSubMenus.includes(sub.name);
    const SubIcon = sub.icon || (hasChildren ? ChevronDown : Box);

    return (
      <div key={sub.name} className="flex flex-col">
        {hasChildren ? (
          <div className="flex flex-col">
            <button
              onClick={() => toggleSubMenu(sub.name)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300
                ${isExpanded ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-[#14b8a6]/20 text-[#14b8a6]' : 'text-gray-500'}`}>
                  <SubIcon size={16} />
                </div>
                {sub.name}
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isExpanded && (
              <div className="ml-6 pl-4 border-l border-white/10 mt-1 space-y-1">
                {sub.subItems!.map(child => renderSubItem(child, sub.subItems))}
              </div>
            )}
          </div>
        ) : (
          <Link
            href={sub.href || '#'}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300
              ${isRouteActive ? 'bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/30 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <SubIcon size={16} className={isRouteActive ? 'text-[#14b8a6]' : 'text-gray-500'} />
            <span>{sub.name}</span>
            {isRouteActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#14b8a6] shadow-[0_0_8px_rgba(20,184,166,0.8)]" />}
          </Link>
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
        <div className={`relative px-6 flex items-center justify-center border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md h-24 transition-all duration-500`}>
          <div className="transition-all duration-500 transform opacity-100 scale-100 w-full flex justify-center">
            <div className="w-full max-w-[160px] flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={150} 
                height={50} 
                className="object-contain" 
                priority 
              />
            </div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const ItemIcon = item.icon || Box;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = openSubMenus.includes(item.name);
            const isChildActive = item.subItems?.some(sub =>
              pathname === sub.href ||
              pathname.startsWith(sub.href + '/') ||
              sub.subItems?.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
            );
            const isDirectActive = item.href === '/' ? pathname === '/' : (item.href && (pathname === item.href || pathname.startsWith(item.href + '/')));
            const isRouteActive = isChildActive || isDirectActive;

            if (hasSubItems) {
              return (
                <div key={item.name} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300
                      ${isExpanded ? 'bg-white/5 shadow-inner' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 
                        ${isRouteActive 
                          ? 'bg-[#14b8a6] text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]' 
                          : 'bg-white/5 text-gray-400 group-hover:text-gray-200'}`}>
                        <ItemIcon size={20} />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={`text-[14px] font-bold ${isRouteActive ? 'text-white' : 'text-gray-300'}`}>
                          {item.name}
                        </span>

                      </div>
                    </div>
                    {isOpen && <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#14b8a6]' : 'text-gray-600'}`} />}
                  </button>
                  {isExpanded && isOpen && (
                    <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-[#14b8a6]/20 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
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
                className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                  ${isDirectActive ? 'bg-[#14b8a6] text-white shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'hover:bg-white/5 text-gray-300'}`}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${isDirectActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'}`}>
                  <ItemIcon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold">{item.name}</span>
                  {isOpen && <span className={`text-[10px] font-medium uppercase tracking-tighter ${isDirectActive ? 'text-white/70' : 'text-gray-500'}`}>Quick Access</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-xl">
        <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#0f766e] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0f766e] text-white font-black rounded-2xl shadow-xl transition-all duration-300 uppercase tracking-widest text-[11px] group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          {isOpen && 'Sign Out System'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
