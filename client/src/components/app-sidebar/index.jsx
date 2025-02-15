import React, { useState } from 'react';
import { 
  Calendar, 
  Home, 
  Inbox, 
  Search, 
  Settings, 
  Users, 
  FileText, 
  Bell, 
  Folder, 
  Star,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  PieChart,
  HelpCircle,
  Menu,
  X,
  LogOut,
  User,
  Box,
  User2
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    badge: "New"
  },
  {
    title: "Customer",
    url: "/dashboard/customer",
    icon: User2,
  },
  
];

const bottomItems = [
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  }
];

export function AppSidebar() {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleMenu = (title) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderMenuItem = (item) => {
    if (item.children) {
      return (
        <SidebarMenuItem key={item.title} className="flex flex-col">
          <SidebarMenuButton
            className="flex items-center justify-between w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-150"
            onClick={() => toggleMenu(item.title)}
          >
            <div className="flex items-center gap-2">
              <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.title}</span>
            </div>
            {!isCollapsed && (
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedMenus[item.title] ? 'rotate-180' : ''
                }`}
              />
            )}
          </SidebarMenuButton>
          
          {expandedMenus[item.title] && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <SidebarMenuItem key={child.title}>
                  <SidebarMenuButton asChild>
                    <a href={child.url} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group transition-colors duration-150">
                      <div className="flex items-center gap-2">
                        <child.icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-500">{child.title}</span>
                      </div>
                      {child.badge && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                          {child.badge}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <a href={item.url} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group transition-colors duration-150">
            <div className="flex items-center gap-2">
              <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-500" />
              <span className={`text-gray-700 dark:text-gray-300 group-hover:text-blue-500 ${isCollapsed ? 'hidden' : 'block'}`}>
                {item.title}
              </span>
            </div>
            {item.badge && !isCollapsed && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                {item.badge}
              </span>
            )}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
      <SidebarContent className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header with collapse button */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
        
        {/* User Profile Section */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'items-center' : ''}`}>
          <div className="flex items-center gap-3" onClick={() => !isCollapsed && setShowProfileMenu(!showProfileMenu)}>
            <div className="relative">
              <img 
                src="/api/placeholder/40/40" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <h3 className="text-sm font-semibold dark:text-white">John Doe</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          {showProfileMenu && !isCollapsed && (
            <div className="mt-2 py-2 px-1 space-y-1">
              <a href="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <User className="w-4 h-4" />
                Profile
              </a>
              <a href="/logout" className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <LogOut className="w-4 h-4" />
                Logout
              </a>
            </div>
          )}
        </div>
        
        <SidebarGroup className="flex-grow">
          <SidebarGroupLabel className={`px-4 text-sm font-medium text-gray-500 dark:text-gray-400 ${isCollapsed ? 'hidden' : 'block'}`}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto border-t border-gray-200 dark:border-gray-700">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;