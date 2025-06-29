"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Header({ onTabChange }) {
  const [activeTab, setActiveTab] = useState("users");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDropdownOpen, setIsLogoutDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is clicked
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLogoutDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-10 sm:w-32 sm:h-12 lg:w-40 lg:h-14 xl:w-48 xl:h-16">
              <Image
                src="/logo-hotal-1.jpg"
                alt="Hotel Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, (max-width: 1280px) 160px, 192px"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-8">
            <button
              onClick={() => handleTabClick("users")}
              className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-all duration-200 ${
                activeTab === "users"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:shadow-sm"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabClick("booking")}
              className={`px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-all duration-200 ${
                activeTab === "booking"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:shadow-sm"
              }`}
            >
              Room Booking
            </button>
          </nav>

          {/* User Profile/Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLogoutDropdownOpen(!isLogoutDropdownOpen)}
                className="flex items-center py-2 px-3 lg:px-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
              >
                <span className="text-xs lg:text-sm font-medium text-gray-700">
                  {currentUser?.email || 'Admin'}
                </span>
                <svg
                  className="ml-2 h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {/* Logout Dropdown */}
              {isLogoutDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <button
              onClick={() => handleTabClick("users")}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                activeTab === "users"
                  ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => handleTabClick("booking")}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                activeTab === "booking"
                  ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Room Booking
            </button>
            <div className="px-3 py-2">
              <div className="py-2 px-3 bg-gray-100 rounded-full inline-block">
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.email || 'Admin'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
