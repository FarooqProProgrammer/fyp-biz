import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Search, 
  MessageSquare, 
  Menu, 
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const Header = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);



    const {data:session} = useSession();



    useEffect(()=>{
        console.log(session)
    },[session])



  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-[1920px] mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-[300px] bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Messages */}
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={`http://localhost:3001/${session?.user?.image}`}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Your Profile</a>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100">Help Center</a>
                <div className="border-t border-gray-200 my-1" />
                <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;