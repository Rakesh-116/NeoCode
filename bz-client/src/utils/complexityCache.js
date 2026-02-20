import CryptoJS from 'crypto-js';

class ComplexityCache {
  constructor() {
    this.cacheKey = 'neocode_complexity_cache';
    this.maxCacheSize = 100; // Maximum number of cached complexities
  }

  // Generate a hash key from code and language
  generateCacheKey(code, language) {
    const combined = `${language.toLowerCase()}:${code.trim()}`;
    return CryptoJS.MD5(combined).toString();
  }

  // Get cached complexity for a given code
  getCachedComplexity(code, language) {
    try {
      const cache = this.getCache();
      const key = this.generateCacheKey(code, language);
      
      if (cache[key]) {
        // Update access time for LRU eviction
        cache[key].lastAccessed = Date.now();
        this.saveCache(cache);
        
        return {
          found: true,
          complexity: cache[key].complexity,
          timestamp: cache[key].timestamp,
          fromCache: true
        };
      }
      
      return { found: false };
    } catch (error) {
      console.error('Error reading from complexity cache:', error);
      return { found: false };
    }
  }

  // Store complexity in cache
  setCachedComplexity(code, language, complexity) {
    try {
      let cache = this.getCache();
      const key = this.generateCacheKey(code, language);
      
      // Add new entry
      cache[key] = {
        complexity,
        language,
        timestamp: new Date().toISOString(),
        lastAccessed: Date.now()
      };

      // Implement LRU eviction if cache is too large
      if (Object.keys(cache).length > this.maxCacheSize) {
        cache = this.evictLeastRecentlyUsed(cache);
      }

      this.saveCache(cache);
      
      return {
        success: true,
        complexity,
        fromCache: false
      };
    } catch (error) {
      console.error('Error writing to complexity cache:', error);
      return { success: false };
    }
  }

  // Get the entire cache object
  getCache() {
    try {
      const cacheStr = localStorage.getItem(this.cacheKey);
      return cacheStr ? JSON.parse(cacheStr) : {};
    } catch (error) {
      console.error('Error parsing complexity cache:', error);
      return {};
    }
  }

  // Save cache to localStorage
  saveCache(cache) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving complexity cache:', error);
      // If localStorage is full, clear some old entries
      if (error.name === 'QuotaExceededError') {
        this.clearOldEntries();
      }
    }
  }

  // Remove least recently used entries
  evictLeastRecentlyUsed(cache) {
    const entries = Object.entries(cache);
    
    // Sort by last accessed time (oldest first)
    entries.sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);
    
    // Keep only the most recent entries
    const keepCount = Math.floor(this.maxCacheSize * 0.8); // Keep 80%
    const keptEntries = entries.slice(-keepCount);
    
    return Object.fromEntries(keptEntries);
  }

  // Clear old entries (older than 7 days)
  clearOldEntries() {
    try {
      const cache = this.getCache();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const filteredCache = {};
      Object.entries(cache).forEach(([key, entry]) => {
        if (entry.lastAccessed > sevenDaysAgo) {
          filteredCache[key] = entry;
        }
      });
      
      this.saveCache(filteredCache);
    } catch (error) {
      console.error('Error clearing old cache entries:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    const cache = this.getCache();
    const entries = Object.values(cache);
    
    return {
      totalEntries: entries.length,
      languages: [...new Set(entries.map(e => e.language))],
      oldestEntry: entries.length ? new Date(Math.min(...entries.map(e => new Date(e.timestamp)))).toISOString() : null,
      newestEntry: entries.length ? new Date(Math.max(...entries.map(e => new Date(e.timestamp)))).toISOString() : null
    };
  }

  // Clear all cache
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      return { success: true };
    } catch (error) {
      console.error('Error clearing complexity cache:', error);
      return { success: false };
    }
  }
}

export default ComplexityCache;