import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface CrawlResult {
  crawled: number;
  saved: number;
  details?: number;
}

export interface CrawlMultipleResult {
  totalCrawled: number;
  totalSaved: number;
}

export const crawlerApi = {
  // Test crawler
  test: async (): Promise<ApiResponse<{ girlsFound: number; sample: any[] }>> => {
    const response = await apiClient.get<ApiResponse<{ girlsFound: number; sample: any[] }>>('/crawler/test');
    return response.data;
  },

  // Crawl single page
  crawl: async (page: number = 1, limit: number = 60, crawlDetails: boolean = false): Promise<ApiResponse<CrawlResult>> => {
    const response = await apiClient.post<ApiResponse<CrawlResult>>('/crawler/crawl', {
      page,
      limit,
      crawlDetails,
    });
    return response.data;
  },

  // Crawl multiple pages
  crawlMultiple: async (startPage: number = 1, endPage: number = 5): Promise<ApiResponse<CrawlMultipleResult>> => {
    const response = await apiClient.post<ApiResponse<CrawlMultipleResult>>('/crawler/crawl-multiple', {
      startPage,
      endPage,
    });
    return response.data;
  },

  // Close browser
  closeBrowser: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/crawler/close');
    return response.data;
  },
};

