'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportForumData } from '@/lib/services/forum';

export function ExportForumData() {
  const [loading, setLoading] = useState(false);
  
  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await exportForumData();
      
      // Create a blob and download the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forum-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting forum data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : 'Export Forum Data'}
    </Button>
  );
}