'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 pb-8 bg-white">
          <div className="max-w-[1800px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
