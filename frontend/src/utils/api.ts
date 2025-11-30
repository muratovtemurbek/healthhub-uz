// API response'ni array ga parse qilish
export const parseApiResponse = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  if (typeof data === 'object') {
    // Agar object bo'lsa, values'ni olishga harakat qilamiz
    const values = Object.values(data);
    if (values.length > 0 && Array.isArray(values[0])) {
      return values[0] as any[];
    }
  }
  return [];
};