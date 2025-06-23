'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../Components/Header';
import UserList from '../../Components/UserList';
import BookingList from '../../Components/BookingList';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show loading while checking authentication
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {activeTab === 'users' && (
            <UserList />
          )}

          {activeTab === 'booking' && (
            <BookingList />
          )}
        </div>
      </main>
    </div>
  );
} 