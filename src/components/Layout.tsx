'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="main-wrapper h-screen bg-[var(--bg-main)]">
      <Sidebar />
      <div className="content-area flex-1 overflow-hidden">
        <Header />
        <main className="page-content flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1800px] mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
