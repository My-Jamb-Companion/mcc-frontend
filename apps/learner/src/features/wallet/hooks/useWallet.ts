import {useInfiniteQuery, useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ALLOWANCE_QUERY_KEY} from "@/src/features/brainy/hooks/useBrainyChat";
import {
  Currency,
  convertCurrency,
  getGemPacks,
  getPaymentHistory,
  getReceipt,
  getWalletBalance,
  getWalletTransactions,
  purchaseGems,
  unlockCourseWithGems,
} from "../services/wallet.service";

export const useWalletBalance = () =>
  useQuery({queryKey: ["wallet", "balance"], queryFn: getWalletBalance});

export const useGemPacks = () =>
  useQuery({queryKey: ["wallet", "packs"], queryFn: getGemPacks, staleTime: 5 * 60_000});

export const useWalletTransactions = (currency?: Currency) =>
  useInfiniteQuery({
    queryKey: ["wallet", "transactions", currency ?? "all"],
    queryFn: ({pageParam}) => getWalletTransactions(pageParam, currency),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.has_more ? last.page + 1 : undefined),
  });

export const usePaymentHistory = () =>
  useQuery({queryKey: ["wallet", "payments"], queryFn: getPaymentHistory});

export const useReceipt = (txRef: string | null) =>
  useQuery({queryKey: ["wallet", "receipt", txRef], queryFn: () => getReceipt(txRef as string), enabled: !!txRef});

/** Everything that shows a balance: this page, the header chip, the rewards page, Brainy's meter. */
const useRefreshBalances = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({queryKey: ["wallet"]});
    queryClient.invalidateQueries({queryKey: ["rewards"]});
    queryClient.invalidateQueries({queryKey: ALLOWANCE_QUERY_KEY});
  };
};

export const usePurchaseGems = () => useMutation({mutationFn: purchaseGems});

export const useConvertCurrency = () => {
  const refresh = useRefreshBalances();
  return useMutation({
    mutationFn: ({from, to, amount}: {from: Currency; to: Currency; amount: number}) =>
      convertCurrency(from, to, amount),
    onSuccess: refresh,
  });
};

export const useUnlockCourseWithGems = () => {
  const refresh = useRefreshBalances();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({courseId, tierId}: {courseId: string; tierId?: string}) =>
      unlockCourseWithGems(courseId, tierId),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({queryKey: ["courses"]});
    },
  });
};
