import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { Card, ReactGridLayout } from '@shared/schema';
import { DashboardAPI } from '@/api/dashboard';
import { useToast } from '@/hooks/use-toast';

export function useLayout(cards: Card[], dashboardId?: number) {
  const { toast } = useToast();
  const [layout, setLayout] = useState<ReactGridLayout>([]);
  
  // Initialize layout when cards change
  useEffect(() => {
    if (cards && cards.length > 0) {
      const initialLayout = cards.map(card => ({
        ...card.layout,
        i: card.id.toString() // Ensure i is always a string of the card ID
      }));
      setLayout(initialLayout);
    } else {
      setLayout([]);
    }
  }, [cards]);
  
  // Save layout mutation
  const saveLayoutMutation = useMutation({
    mutationFn: (newLayout: ReactGridLayout) => {
      if (!dashboardId) throw new Error("Dashboard ID is required");
      return DashboardAPI.saveLayout(dashboardId, newLayout);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save layout: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Debounced save function
  const debouncedSave = useCallback(
    debounce((newLayout: ReactGridLayout) => {
      if (dashboardId) {
        saveLayoutMutation.mutate(newLayout);
      }
    }, 1000),
    [dashboardId]
  );
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: ReactGridLayout) => {
    setLayout(newLayout);
    debouncedSave(newLayout);
  }, [debouncedSave]);
  
  return {
    layout,
    handleLayoutChange,
    isLayoutSaving: saveLayoutMutation.isPending
  };
}
