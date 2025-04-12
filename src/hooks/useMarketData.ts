import { useState, useEffect, useMemo } from 'react';
import apiClient from '../lib/axios'; // Import the new Axios client
import { useExchangeRate } from './useExchangeRate'; // Import the exchange rate hook

// --- Types ---

// Structure of item returned by Steam API (/api/query)
export interface SteamItemRaw {
  hash_name: string;
  sell_listings: number;
  sell_price: number; // In cents
  sell_price_text: string;
  app_name: string;
  asset_description: {
    icon_url: string;
  };
  // Add other fields if necessary
}

// Structure returned by Buff Price API (/api/buff_price) - Adjust as needed!
interface BuffPriceResponse {
  price: number | null; // Assuming the backend returns { "price": 123.45 } or { "price": null }
}

// Combined item structure used in the table
export interface CombinedItem extends SteamItemRaw {
  buff_price_cny?: number | null;
  profit_buff_to_steam?: number;
  profit_margin_buff_to_steam?: number;
  profit_steam_to_buff?: number;
  profit_margin_steam_to_buff?: number;
  total_profit_buff_to_steam?: number;
  total_profit_steam_to_buff?: number;
}

interface UseMarketDataProps {
  // accessToken is no longer needed here, apiClient handles it
  domain: string;
  currentPage: number;
  itemsPerPage: number;
}

interface UseMarketDataResult {
  combinedData: CombinedItem[];
  totalCount: number;
  loading: boolean; // Consolidated loading state
  error: string | null; // Consolidated error state
  usdToCnyRate: number | null; // Expose rate for display
}

// --- Constants ---
const STEAM_FEE_RATE = 0.15; // 15%
const BUFF_FEE_RATE = 0.025; // 2.5%

// --- Hook Implementation ---
export function useMarketData({
  // accessToken removed
  domain,
  currentPage,
  itemsPerPage,
}: UseMarketDataProps): UseMarketDataResult {
  const [steamData, setSteamData] = useState<SteamItemRaw[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [buffPrices, setBuffPrices] = useState<Record<string, number | null>>({});
  const [loadingSteam, setLoadingSteam] = useState(true);
  const [loadingBuff, setLoadingBuff] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [buffError, setBuffError] = useState<string | null>(null);

  // Use the exchange rate hook
  const { rate: usdToCnyRate, loading: loadingRate, error: rateError } = useExchangeRate();

  // Fetch Steam Data
  useEffect(() => {
    // No need to check accessToken here, apiClient handles it or fails gracefully
    let isMounted = true;
    const fetchSteam = async () => {
      setLoadingSteam(true);
      setSteamError(null);
      setSteamData([]); // Clear previous data
      setBuffPrices({}); // Clear Buff prices when Steam data reloads

      const params = new URLSearchParams({
        start: String((currentPage - 1) * itemsPerPage),
        count: String(itemsPerPage),
        // Basic sorting from API - complex sorting happens on combined data later
        sort_column: "sell_listings", 
        sort_dir: "desc"
      });

      try {
        // Use apiClient.get instead of fetch
        const response = await apiClient.get(`https://${domain}/api/query`, { params });
        // Axios puts data directly in response.data
        const result = response.data; 
        if (!result.success) throw new Error('Steam API返回数据异常');

        if (isMounted) {
          setSteamData(result.results || []);
          setTotalCount(result.total_count || 0);
        }
      } catch (err: any) { // Catch Axios errors
        console.error('Steam数据获取失败:', err);
        if (isMounted) {
          // Extract error message from Axios error or standard error
          const message = err.response?.data?.message || err.message || '获取Steam数据时发生未知错误';
          setSteamError(`Steam数据获取失败: ${message}`);
          setSteamData([]);
          setTotalCount(0);
        }
      } finally {
        if (isMounted) {
          setLoadingSteam(false);
        }
      }
    };

    fetchSteam();
    return () => { isMounted = false; };
    // Remove accessToken from dependencies
  }, [currentPage, itemsPerPage, domain]); 

  // Fetch Buff Prices for current Steam items
  useEffect(() => {
    // Remove accessToken check
    if (!steamData.length) {
      setLoadingBuff(false); // Not loading if no data to fetch for
      return;
    }

    let isMounted = true;
    const fetchBuffs = async () => {
      setLoadingBuff(true);
      setBuffError(null);
      const newBuffPrices: Record<string, number | null> = {};

      const promises = steamData.map(item =>
        // Use apiClient.get
        apiClient.get<BuffPriceResponse>(`https://${domain}/api/buff_price`, {
          params: {
            hash_name: item.hash_name,
            game: item.app_name,
          }
        })
        .then(response => {
            // Axios data is in response.data
            const buffResult = response.data; 
            if (buffResult && typeof buffResult.price === 'number') {
                 newBuffPrices[item.hash_name] = buffResult.price;
            } else {
                 console.warn(`未找到 ${item.hash_name} 的Buff价格或格式错误`, buffResult);
                 newBuffPrices[item.hash_name] = null; // Indicate price not found/error
            }
        })
        .catch((err: any) => { // Catch Axios errors
            console.error(`获取 ${item.hash_name} 的Buff价格失败:`, err);
            // Extract error message
            const message = err.response?.data?.message || err.message || '未知错误';
            setBuffError(`获取部分Buff价格失败 (${item.hash_name}): ${message}`); // Set specific Buff error
            newBuffPrices[item.hash_name] = null; // Indicate error
        })
      );

      // Use Promise.allSettled to wait for all requests, even if some fail
      await Promise.allSettled(promises); 
      if (isMounted) {
        setBuffPrices(newBuffPrices);
        setLoadingBuff(false);
      }
    };

    fetchBuffs();
    return () => { isMounted = false; };
    // Remove accessToken from dependencies
  }, [steamData, domain]); 

  // Calculate combined data
  const combinedData = useMemo((): CombinedItem[] => {
    if (!steamData.length || usdToCnyRate === null) return [];

    return steamData.map((item): CombinedItem => {
      const buffPriceCNY = buffPrices[item.hash_name];
      const steamPriceUSD = item.sell_price / 100;
      const steamPriceCNY = steamPriceUSD * usdToCnyRate;

      let calculated: Partial<CombinedItem> = {};

      if (buffPriceCNY !== undefined && buffPriceCNY !== null) {
        // Buff -> Steam
        const profitB2S = (steamPriceCNY * (1 - STEAM_FEE_RATE)) - buffPriceCNY;
        const marginB2S = buffPriceCNY > 0 ? (profitB2S / buffPriceCNY) * 100 : 0;
        const totalProfitB2S = profitB2S * item.sell_listings;

        // Steam -> Buff
        const profitS2B = (buffPriceCNY * (1 - BUFF_FEE_RATE)) - steamPriceCNY;
        const marginS2B = steamPriceCNY > 0 ? (profitS2B / steamPriceCNY) * 100 : 0;
        const totalProfitS2B = profitS2B * item.sell_listings;

        calculated = {
          buff_price_cny: buffPriceCNY,
          profit_buff_to_steam: profitB2S,
          profit_margin_buff_to_steam: marginB2S,
          profit_steam_to_buff: profitS2B,
          profit_margin_steam_to_buff: marginS2B,
          total_profit_buff_to_steam: totalProfitB2S,
          total_profit_steam_to_buff: totalProfitS2B,
        };
      } else {
         calculated = { buff_price_cny: buffPriceCNY }; // null or undefined
      }

      return { ...item, ...calculated };
    });
  }, [steamData, buffPrices, usdToCnyRate]);

  // Consolidate loading and error states
  const loading = loadingRate || loadingSteam || loadingBuff;
  const error = rateError || steamError || buffError; // Prioritize errors

  return { combinedData, totalCount, loading, error, usdToCnyRate };
}
