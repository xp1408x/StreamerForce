// app/dashboard/mod/users/page.tsx
'use client';

import React from 'react';
import DashboardClientLayout from '@/components/dashboard/dashboard-layout';

export default function ModUsersPage() {
  return (
    <DashboardClientLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Aquí podrás ver y gestionar la lista de usuarios.
        </p>
        {/* Future content for user list and management */}
      </div>
    </DashboardClientLayout>
  );
}