import { useState, useRef, useCallback } from 'react';
import { SliderVideoItem, LiveChannel } from '../types/api';
import { getReplaysForChannels, getRelatedItems } from '../services/api';

/**
 * Hook to manage progressive fetching of replays from a list of channels
 */
export function useReplayFetcher(
    initialReplays: SliderVideoItem[],
    allChannels: LiveChannel[],
    batchSize: number = 2
) {
    const [replays, setReplays] = useState<SliderVideoItem[]>(initialReplays);
    const [loading, setLoading] = useState(false);

    // Track which channels we have already fetched
    // We assume initialReplays might come from a fast source (alaunesliders) 
    // or the first few channels. 
    // Strategy: We will iterate through allChannels from the beginning 
    // (or after a certain index if we know where we started) 
    // and fetch their replays, merging them in.
    // NOTE: This might duplicate items if initialReplays contains some of them.
    // We should filter duplicates based on slug.

    const nextChannelIndex = useRef(0);
    const hasMoreChannels = useRef(allChannels.length > 0);

    // Track a pool of pagination URLs from different shows
    const paginationPool = useRef<Set<string>>(new Set());
    const seenUrls = useRef<Set<string>>(new Set());
    const initialized = useRef(false);

    // Helper to find channel logo based on video info
    const getLogoForVideo = (video: SliderVideoItem) => {
        if (video.channel_logo) return video.channel_logo;

        const searchStr = (video.feed_url || video.video_url || video.slug || "").toLowerCase();

        // Find matching channel based on title or slug patterns in the video URL
        const matchedChannel = allChannels.find(ch => {
            const chTitle = ch.title.toLowerCase();
            if (chTitle === 'crtv news' && (searchStr.includes('news') || searchStr.includes('50005'))) return true;
            if (chTitle === 'crtv sport' && (searchStr.includes('sport') || searchStr.includes('50006'))) return true;
            if (chTitle === 'crtv' && (searchStr.includes('crtv-') || searchStr.includes('50004')) && !searchStr.includes('news') && !searchStr.includes('sport')) return true;
            return false;
        });

        return matchedChannel?.logo_url || matchedChannel?.logo || undefined;
    };

    // Initialize pool from initial replays and enrich with logos
    if (!initialized.current && initialReplays.length > 0) {
        setReplays(current => {
            return current.map(item => ({
                ...item,
                channel_logo: getLogoForVideo(item)
            }));
        });

        initialReplays.forEach(item => {
            if (item.relatedItems && !seenUrls.current.has(item.relatedItems)) {
                paginationPool.current.add(item.relatedItems);
            }
        });
        initialized.current = true;
    }

    const allChannelsRef = useRef(allChannels);
    // Update ref when channels change
    if (allChannelsRef.current !== allChannels) {
        allChannelsRef.current = allChannels;
    }

    const loadMoreReplays = useCallback(async () => {
        if (loading || (!hasMoreChannels.current && paginationPool.current.size === 0)) return;

        setLoading(true);

        try {
            let newReplays: SliderVideoItem[] = [];

            // 1. Try to fetch from next batch of channels if any
            if (hasMoreChannels.current) {
                const channelsToFetch = allChannelsRef.current.slice(
                    nextChannelIndex.current,
                    nextChannelIndex.current + batchSize
                );

                if (channelsToFetch.length > 0) {
                    console.log(`Fetching from channels: ${channelsToFetch.map(c => c.title).join(', ')}`);
                    const channelReplays = await getReplaysForChannels(channelsToFetch);

                    // Add new pagination URLs to pool
                    channelReplays.forEach(item => {
                        if (item.relatedItems && !seenUrls.current.has(item.relatedItems)) {
                            paginationPool.current.add(item.relatedItems);
                        }
                    });

                    newReplays = [...newReplays, ...channelReplays];

                    nextChannelIndex.current += batchSize;
                    if (nextChannelIndex.current >= allChannelsRef.current.length) {
                        hasMoreChannels.current = false;
                    }
                } else {
                    hasMoreChannels.current = false;
                }
            }

            // 2. Fetch from the pagination pool (multiple shows at once)
            // If we have very few new items or finished channels, dive into the pool
            if (paginationPool.current.size > 0 && (newReplays.length < 5 || !hasMoreChannels.current)) {
                const urlsToFetch = Array.from(paginationPool.current).slice(0, 3);
                console.log(`Fetching from ${urlsToFetch.length} pagination URLs concurrently...`);

                // Remove from pool and mark as seen to avoid loops
                urlsToFetch.forEach(url => {
                    paginationPool.current.delete(url);
                    seenUrls.current.add(url);
                });

                const paginatedBatches = await Promise.all(
                    urlsToFetch.map(async url => {
                        try {
                            return await getRelatedItems(url);
                        } catch (e) {
                            console.error(`Failed to fetch pagination URL ${url}:`, e);
                            return [];
                        }
                    })
                );

                const paginatedItems = paginatedBatches.flat();
                console.log(`Fetched ${paginatedItems.length} items total from pagination batches`);

                // For each newly fetched item, add its relatedItems back to the pool
                paginatedItems.forEach(item => {
                    if (item.relatedItems && !seenUrls.current.has(item.relatedItems)) {
                        paginationPool.current.add(item.relatedItems);
                    }
                });

                newReplays = [...newReplays, ...paginatedItems];
            }

            if (newReplays.length > 0) {
                // Enrich all new replays with channel logos
                const enrichedNewReplays = newReplays.map(item => ({
                    ...item,
                    channel_logo: getLogoForVideo(item)
                }));

                setReplays(prev => {
                    const existingSlugs = new Set(prev.map(r => r.slug));
                    const uniqueNewReplays = enrichedNewReplays.filter(r => r.slug && !existingSlugs.has(r.slug));

                    if (uniqueNewReplays.length === 0) return prev;

                    const combined = [...prev, ...uniqueNewReplays];

                    return combined.sort((a, b) => {
                        const parseDate = (dateStr: string, timeStr: string) => {
                            if (!dateStr) return 0;
                            // Handle both dd/mm/yyyy and dd-mm-yyyy
                            const [day, month, year] = dateStr.split(/[/-]/).map(Number);
                            const [hours, minutes] = (timeStr || "00:00").split(':').map(Number);
                            return new Date(year, month - 1, day, hours, minutes).getTime();
                        };
                        return parseDate(b.date, b.time) - parseDate(a.date, a.time);
                    });
                });
            }

        } catch (error) {
            console.error("Error in useReplayFetcher:", error);
        } finally {
            setLoading(false);
        }
    }, [batchSize, loading, allChannels]); // Added allChannels to dependencies

    return {
        replays,
        loading,
        hasMore: hasMoreChannels.current || paginationPool.current.size > 0,
        loadMore: loadMoreReplays
    };
}
