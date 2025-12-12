/**
 * Helper function to unwrap backend response
 * Backend wraps all responses in {success: true, data: {...}}
 */
export function unwrapResponse<T>(response: any): T {
  // If response is already unwrapped (direct data)
  if (response && !response.success && !response.data) {
    return response;
  }

  // If wrapped in {success: true, data: {...}}
  if (response?.success && response?.data) {
    return response.data;
  }

  // If response.data exists but not wrapped
  if (response?.data) {
    return response.data;
  }

  // Fallback: return as is
  return response;
}

/**
 * Helper to check if response is an array
 */
export function isArrayResponse<T>(response: any): response is T[] {
  return Array.isArray(response);
}

/**
 * Helper to safely get paginated response
 * Input can be:
 * 1. Already unwrapped: { data: [...], meta: {...} }
 * 2. Wrapped: { success: true, data: { data: [...], meta: {...} } }
 */
export function getPaginatedData<T>(response: any): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  console.log('[getPaginatedData] Input:', response);
  
  // Don't unwrap again if already unwrapped (has data and meta at top level)
  let parsed = response;
  
  // Check if response has data array and meta object at top level
  if (parsed && typeof parsed === 'object') {
    // Format 1: { data: [...], total, page, limit, totalPages } (new format)
    if (Array.isArray(parsed.data) && typeof parsed.total === 'number') {
      console.log('[getPaginatedData] New format - Direct parse');
      return {
        data: parsed.data,
        total: parsed.total,
        page: parsed.page || 1,
        limit: parsed.limit || parsed.data.length,
        totalPages: parsed.totalPages || (parsed.total > 0 ? Math.ceil(parsed.total / (parsed.limit || parsed.data.length)) : 0),
      };
    }
    
    // Format 2: { data: [...], meta: {...} } (old format)
    if (Array.isArray(parsed.data) && parsed.meta && typeof parsed.meta === 'object') {
      const data = parsed.data;
      const meta = parsed.meta;
      
      console.log('[getPaginatedData] Old format - Meta:', meta);
      
      const total = meta.total || meta.totalCount || data.length;
      const limit = meta.limit || meta.pageSize || 20;
      const page = meta.page || meta.currentPage || 1;
      const totalPages = meta.totalPages || (total > 0 ? Math.ceil(total / limit) : 0);
      
      console.log('[getPaginatedData] Result:', { total, page, limit, totalPages });
      
      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    }
    
    // If wrapped in success/data structure, unwrap first
    if (parsed.success && parsed.data) {
      parsed = parsed.data;
      console.log('[getPaginatedData] Unwrapped success wrapper:', parsed);
      
      // Check new format first
      if (Array.isArray(parsed.data) && typeof parsed.total === 'number') {
        return {
          data: parsed.data,
          total: parsed.total,
          page: parsed.page || 1,
          limit: parsed.limit || parsed.data.length,
          totalPages: parsed.totalPages || (parsed.total > 0 ? Math.ceil(parsed.total / (parsed.limit || parsed.data.length)) : 0),
        };
      }
      
      // Check old format
      if (Array.isArray(parsed.data) && parsed.meta) {
        const data = parsed.data;
        const meta = parsed.meta;
        
        const total = meta.total || meta.totalCount || data.length;
        const limit = meta.limit || meta.pageSize || 20;
        const page = meta.page || meta.currentPage || 1;
        const totalPages = meta.totalPages || (total > 0 ? Math.ceil(total / limit) : 0);
        
        console.log('[getPaginatedData] After unwrap - Result:', { total, page, limit, totalPages });
        
        return {
          data,
          total,
          page,
          limit,
          totalPages,
        };
      }
    }
  }
  
  // Fallback: if data is array directly
  if (Array.isArray(parsed)) {
    console.log('[getPaginatedData] Fallback: array response');
    return {
      data: parsed,
      total: parsed.length,
      page: 1,
      limit: parsed.length,
      totalPages: 1,
    };
  }
  
  // Last fallback
  console.log('[getPaginatedData] Fallback: empty response');
  return {
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };
}

