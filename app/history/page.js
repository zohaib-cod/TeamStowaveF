'use client';
import React from 'react';
import MainLayout from '../../components/MainLayout';
import OperationsHistoryView from '../../components/OperationsHistoryView';

export default function HistoryPage() {
  return (
    <MainLayout>
      <OperationsHistoryView />
    </MainLayout>
  );
}
