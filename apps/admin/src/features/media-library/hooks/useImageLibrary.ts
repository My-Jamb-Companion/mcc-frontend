import {keepPreviousData, useInfiniteQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteLibraryImages, listLibraryImages} from "../services/imageLibrary.service";
import {allImages, nextOffset} from "../helper/imageLibrary";

export const IMAGE_LIBRARY_KEY = ["admin-image-library"] as const;

/** The images uploaded earlier, a page at a time; `enabled` keeps it from loading until the picker is opened. */
export function useImageLibrary(search: string, enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: [...IMAGE_LIBRARY_KEY, search],
    queryFn: ({pageParam}) => listLibraryImages({search, offset: pageParam}),
    initialPageParam: 0,
    getNextPageParam: (_last, pages) => nextOffset(pages),
    enabled,
    placeholderData: keepPreviousData,
    // Someone else may have uploaded since: look again each time the picker opens.
    staleTime: 0,
  });
  const pages = query.data?.pages ?? [];
  return {
    images: allImages(pages),
    total: pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: !!query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
    loadingMore: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}

/** Deleting images; the library is read again afterwards. */
export function useDeleteLibraryImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (urls: string[]) => deleteLibraryImages(urls),
    onSuccess: () => queryClient.invalidateQueries({queryKey: IMAGE_LIBRARY_KEY}),
  });
}
