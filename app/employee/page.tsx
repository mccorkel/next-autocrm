"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/employee/agent-dashboard');
  }, [router]);

  return null;
} 