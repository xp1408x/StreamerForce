"use client";

import React from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
