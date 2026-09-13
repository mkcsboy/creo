import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  DollarSign,
  FileStack,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Puzzle,
  Settings,
  Shield,
  UserCog,
  Users,
  ChevronLeft,
  X,
  Search,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../lib/auth-context";
import { request } from "../../lib/http";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles?: string[];
}

interface NavGroup {
  name: string;
  shortName: string;
  icon: any;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    name: "Operations",
    shortName: "OPS",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "super_admin"] },
      { label: "Task Queue", href: "/admin/tasks", icon: CheckSquare, roles: ["admin", "super_admin", "team_member", "team_lead", "editor", "designer"] },
      { label: "Clients Roster", href: "/admin/clients", icon: Users, roles: ["admin", "super_admin"] },
    ],
  },
  {
    name: "Production",
    shortName: "PROD",
    icon: FileStack,
    items: [
      { label: "Content Calendar", href: "/admin/calendar", icon: CalendarDays, roles: ["admin", "super_admin", "team_lead", "team_member", "editor", "designer"] },
      { label: "Deliverables", href: "/admin/deliverables", icon: FileStack, roles: ["admin", "super_admin", "team_lead", "team_member", "editor", "designer"] },
    ],
  },
  {
    name: "Team & Culture",
    shortName: "TEAM",
    icon: Users,
    items: [
      { label: "Team Management", href: "/admin/teams", icon: UserCog, roles: ["admin", "super_admin", "team_lead"] },
      { label: "Leave Approvals", href: "/admin/leave", icon: CalendarCheck, roles: ["admin", "super_admin", "team_lead", "team_member", "editor", "designer"] },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone, roles: ["admin", "super_admin", "team_lead", "team_member", "editor", "designer"] },
    ],
  },
  {
    name: "Business & Support",
    shortName: "BIZ",
    icon: BarChart3,
    items: [
      { label: "Support Tickets", href: "/admin/support", icon: LifeBuoy, roles: ["admin", "super_admin", "team_lead", "team_member", "editor", "designer"] },
      { label: "SLA Escalations", href: "/admin/escalations", icon: AlertTriangle, roles: ["admin", "super_admin"] },
      { label: "Financial Reports", href: "/admin/reports", icon: BarChart3, roles: ["admin", "super_admin", "investor_relations"] },
      { label: "Sales & Deals", href: "/admin/sales", icon: DollarSign, roles: ["admin", "super_admin", "sales"] },
    ],
  },
];

const SYSTEM_NAV_ITEMS: NavItem[] = [
  { label: "Add-ons Catalog", href: "/admin/addons", icon: Puzzle, roles: ["admin", "super_admin"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin", "super_admin"] },
];

export function OpsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const userRole = user?.role || "admin";
  const isTeamStaff = userRole === "team_lead" || userRole === "team_member" || userRole === "editor" || userRole === "designer";

  const isMainOpsPage = [
    "/admin",
    "/admin/",
    "/admin/clients",
    "/admin/queue",
    "/admin/tasks",
    "/admin/calendar",
    "/admin/deliverables",
    "/admin/support",
    "/admin/teams",
    "/admin/leave",
    "/admin/announcements",
    "/admin/sla",
    "/admin/kpis",
    "/admin/reports",
    "/admin/kpi",
    "/admin/sales",
    "/admin/addons",
    "/admin/escalations",
    "/admin/settings",
  ].includes(location.pathname);

  const { data: notifData } = useQuery<{ unread_count: number; items: any[] }>({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      return await request<{ unread_count: number; items: any[] }>("/api/v1/notifications");
    },
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  const unreadCount = notifData?.unread_count || 0;
  const notifications = notifData?.items || [];

  const handleMarkAllRead = async () => {
    try {
      await request("/api/v1/notifications/mark-all-read", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    } catch {
      // ignore
    }
  };

  const handleItemClick = async (item: any) => {
    if (!item.is_read) {
      try {
        await request(`/api/v1/notifications/${item.id}/read`, { method: "PATCH" });
        queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      } catch {
        // ignore
      }
    }
    if (item.link) {
      setNotificationOpen(false);
      navigate(item.link);
    }
  };

  const visibleNavGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    }).filter((item, index, self) =>
      index === self.findIndex((t) => t.href === item.href)
    ),
  })).filter(group => group.items.length > 0);

  const visibleSystemItems = SYSTEM_NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <div className="flex h-screen overflow-hidden text-[#0D2137]" style={{ background: "linear-gradient(135deg, #E6F0F9 0%, #F8FAFC 100%)" }}>
      {/* ═══════════════════════════════════════════════════════════════
          DYNAMIC ISLAND NAVIGATION — Desktop Only
          A floating top-center glass pill containing all navigation.
      ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex fixed top-4 inset-x-0 z-50 justify-center pointer-events-none select-none">
        <nav
          className="pointer-events-auto flex items-center h-[60px] rounded-full px-2"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 20px 40px -8px rgba(43, 123, 196, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.8)",
          }}
        >
          {/* Logo */}
          <div className="px-5 border-r border-slate-200/60 mr-2 flex items-center h-8">
            <Link to="/admin" className="text-[20px] font-black tracking-tight text-[#0D2137] hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-display, 'Inter', system-ui, sans-serif)" }}>
              creo<span className="text-[#2B7BC4]">.</span>
            </Link>
          </div>

          {/* Nav Categories */}
          <div className="flex items-center gap-1">
            {visibleNavGroups.map(group => {
              const isGroupActive = group.items.some((item) =>
                item.href === "/admin"
                  ? location.pathname === "/admin" || location.pathname === "/admin/dashboard"
                  : location.pathname === item.href
              );
              return (
                <div 
                  key={group.name} 
                  className="relative" 
                  onMouseEnter={() => setHoveredGroup(group.name)} 
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <button
                    className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                      hoveredGroup === group.name || isGroupActive
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "text-[#334155] hover:bg-white hover:text-[#2B7BC4]"
                    }`}
                  >
                    {group.name}
                  </button>
                  
                  {/* Flyout Dropdown */}
                  <AnimatePresence>
                    {hoveredGroup === group.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-[120%] left-1/2 -translate-x-1/2 w-[240px] rounded-3xl p-2 z-[60] bg-white"
                        style={{
                          boxShadow: "0 24px 48px -12px rgba(43, 123, 196, 0.2)",
                          border: "1px solid rgba(43, 123, 196, 0.1)",
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {group.items.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setHoveredGroup(null)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                                  isActive
                                    ? "bg-[#EFF6FF] text-[#1D4ED8]"
                                    : "text-[#334155] hover:bg-slate-50 hover:text-[#2B7BC4]"
                                }`}
                              >
                                <item.icon className="size-[18px] shrink-0" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="ml-3 pl-3 border-l border-slate-200/60 flex items-center gap-1.5 pr-1">
            
            {/* Search */}
            <button className="flex size-9 items-center justify-center rounded-full text-[#64748B] hover:bg-white hover:text-[#2B7BC4] transition-all">
              <Search className="size-4" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)} 
                className="relative flex size-9 items-center justify-center rounded-full text-[#64748B] hover:bg-white hover:text-[#2B7BC4] transition-all"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex size-2 rounded-full border border-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #1D4ED8)" }} />
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div
                  className="absolute right-0 mt-3 w-84 rounded-3xl p-4 shadow-2xl z-50 text-[#0D2137] bg-white"
                  style={{
                    border: "1px solid rgba(43, 123, 196, 0.1)",
                    boxShadow: "0 24px 48px -12px rgba(43, 123, 196, 0.2)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#2B7BC4]/10 pb-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[#2B7BC4]">
                      Alerts
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-[#64748B] hover:text-[#2B7BC4]">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-xs text-[#64748B]">All caught up!</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => handleItemClick(n)} className={`rounded-xl p-3 text-xs space-y-1 cursor-pointer transition-all border ${!n.is_read ? "bg-[#EFF6FF]/70 border-[#2B7BC4]/15" : "bg-white border-transparent hover:bg-slate-50"}`}>
                          <p className={`font-bold ${!n.is_read ? "text-[#0D2137]" : "text-slate-600"}`}>{n.title}</p>
                          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* System / Settings Dropdown */}
            <div className="relative" onMouseEnter={() => setHoveredGroup("System")} onMouseLeave={() => setHoveredGroup(null)}>
              <button className={`flex size-9 items-center justify-center rounded-full transition-all ${hoveredGroup === "System" ? "bg-[#EFF6FF] text-[#1D4ED8]" : "text-[#64748B] hover:bg-white hover:text-[#2B7BC4]"}`}>
                <Settings className="size-4" />
              </button>
              
              <AnimatePresence>
                {hoveredGroup === "System" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-[120%] right-0 w-[220px] rounded-3xl p-2 z-[60] bg-white"
                    style={{
                      boxShadow: "0 24px 48px -12px rgba(43, 123, 196, 0.2)",
                      border: "1px solid rgba(43, 123, 196, 0.1)",
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      {visibleSystemItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setHoveredGroup(null)}
                          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-[#334155] hover:bg-slate-50 hover:text-[#2B7BC4]"
                        >
                          <item.icon className="size-[18px] shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="mx-3 h-px bg-slate-100 my-1" />
                      <button onClick={() => logout()} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 w-full text-left">
                        <LogOut className="size-[18px]" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="size-9 ml-1 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-sm cursor-default" style={{ background: "linear-gradient(135deg, #2B7BC4, #1D4ED8)" }} title={user?.full_name || "Staff Member"}>
              {(user?.full_name?.[0] || "A").toUpperCase()}
            </div>
          </div>
        </nav>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-24">

        {/* ═══════════════════════════════════════════════════════════
            MOBILE TOP BAR
        ═══════════════════════════════════════════════════════════ */}
        <header className="lg:hidden flex h-14 items-center justify-between border-b border-[#2B7BC4]/10 bg-white px-4 shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="size-5" />
            </button>
            {!isMainOpsPage && (
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 2) {
                    navigate(-1);
                  } else {
                    navigate(isTeamStaff ? "/admin/tasks" : "/admin");
                  }
                }}
                className="flex size-7 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#2B7BC4] hover:bg-[#EFF6FF] transition-colors"
                title="Go Back"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            <span className="text-lg font-black tracking-tight text-[#0D2137] select-none" style={{ fontFamily: "var(--font-display, 'Inter', system-ui, sans-serif)" }}>
              creo<span className="text-[#2B7BC4]">.</span>
            </span>
            <span className="text-[10px] font-semibold text-[#2B7BC4] bg-[#EFF6FF] px-1.5 py-0.5 rounded-full border border-[#2B7BC4]/15 ml-0.5">
              {isTeamStaff ? "Team" : "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell (Mobile) */}
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative flex size-8 items-center justify-center rounded-xl text-[#0D2137]/70 hover:bg-[#EFF6FF] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="size-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex size-2 rounded-full" style={{ background: "linear-gradient(135deg, #0EA5E9, #1D4ED8)" }} />
              )}
            </button>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════
            MOBILE SLIDE-OVER DRAWER
        ═══════════════════════════════════════════════════════════ */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <aside className="relative flex flex-col w-72 max-w-[85vw] bg-white text-[#0D2137] h-full shadow-2xl z-10 animate-fade-in rounded-r-3xl">
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between px-5 border-b border-[#2B7BC4]/10 shrink-0">
                <span className="text-xl font-black tracking-tight text-[#0D2137] select-none" style={{ fontFamily: "var(--font-display, 'Inter', system-ui, sans-serif)" }}>
                  creo<span className="text-[#2B7BC4]">.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="size-8 flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#0D2137] hover:bg-[#EFF6FF] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B]/60">
                  {isTeamStaff ? "Production Pipeline" : "Agency Control Panel"}
                </p>

                {visibleNavGroups.map((group) => (
                  <div key={group.name} className="flex flex-col mb-2">
                    <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#64748B]/60">
                      {group.name}
                    </p>
                    {group.items.map((item) => {
                      const isActive =
                        item.href === "/admin"
                          ? location.pathname === "/admin" || location.pathname === "/admin/dashboard"
                          : location.pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all mb-1 ${
                            isActive
                              ? "text-white font-semibold"
                              : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2B7BC4]"
                          }`}
                          style={isActive ? {
                            background: "linear-gradient(135deg, #0EA5E9, #1D4ED8)",
                            boxShadow: "0 4px 14px -2px rgba(43, 123, 196, 0.35)",
                          } : undefined}
                        >
                          <item.icon className="size-4 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}

                <div className="mx-3 h-px w-auto bg-[#2B7BC4]/10 my-2" />

                {visibleSystemItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium transition-all mb-1 ${
                        isActive
                          ? "text-[#2B7BC4] font-semibold bg-[#EFF6FF]"
                          : "text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#2B7BC4]"
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer User Footer */}
              <div className="border-t border-[#2B7BC4]/10 p-3 shrink-0">
                <div className="px-3 py-2 mb-2 flex items-center gap-2.5">
                  <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #2B7BC4, #1D4ED8)" }}
                  >
                    {(user?.full_name?.[0] || "A").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0D2137] truncate">
                      {user?.full_name || "Staff Member"}
                    </p>
                    <p className="text-[10px] text-[#64748B] flex items-center gap-1">
                      <Shield className="size-2.5" />
                      <span className="capitalize">{(user?.role || "Staff").replace("_", " ")}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CONTENT PANE — only this scrolls
        ═══════════════════════════════════════════════════════════ */}
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 animate-page-in">
          <div className="max-w-[1600px] w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
