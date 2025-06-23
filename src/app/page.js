'use client';

import { useState } from 'react';
import Header from '../Components/Header';
import UserList from '../Components/UserList';
import BookingList from '../Components/BookingList';

export default function Home() {
  const [activeTab, setActiveTab] = useState('users');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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
