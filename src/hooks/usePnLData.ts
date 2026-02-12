import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyPnL {
  id: string;
  trade_date: string;
  pnl: number;
  created_at: string;
}

export interface AccountSettings {
  id: string;
  initial_capital: number;
  created_at: string;
  updated_at: string;
}

export const useAccountSettings = () => {
  return useQuery({
    queryKey: ["account-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as AccountSettings;
    },
  });
};

export const useDailyPnL = () => {
  return useQuery({
    queryKey: ["daily-pnl"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_pnl")
        .select("*")
        .order("trade_date", { ascending: true });

      if (error) throw error;
      return data as DailyPnL[];
    },
  });
};

export const useUpsertDailyPnL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trade_date, pnl }: { trade_date: string; pnl: number }) => {
      const { data, error } = await supabase
        .from("daily_pnl")
        .upsert({ trade_date, pnl }, { onConflict: 'trade_date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-pnl"] });
    },
  });
};

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, initial_capital }: { id: string; initial_capital: number }) => {
      const { data, error } = await supabase
        .from("account_settings")
        .update({ initial_capital })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-settings"] });
    },
  });
};

export const useDeleteDailyPnL = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("daily_pnl")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-pnl"] });
    },
  });
};