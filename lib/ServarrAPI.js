'use strict';

/**
 * Servarr API Client
 * 
 * A modern, fetch-based API client for communicating with Servarr applications.
 * Optimized for minimal resource usage.
 */
class ServarrAPI {

  constructor(config) {
    this.baseUrl = (config.baseUrl || '').trim();
    this.port = config.port;
    this.apiKey = config.apiKey;
    this.appName = config.appName;

    // Parse base URL robustly (supports paths and embedded ports)
    let parsed;
    try {
      parsed = new URL(this.baseUrl);
    } catch (err) {
      throw new Error(`Invalid base URL: ${this.baseUrl}`);
    }
    
    // Construct the final base URL, ensuring it doesn't end with a slash
    this.apiUrl = `${parsed.protocol}//${parsed.hostname}`;
    
    // Use port from parsed URL if available, otherwise use config.port if explicitly provided
    const port = parsed.port || this.port;
    if (port) this.apiUrl += `:${port}`;
    
    this.apiUrl += parsed.pathname.replace(/\/$/, '');
    
    const appLower = (this.appName || '').toLowerCase();
    this.apiVersion = config.apiVersion || (appLower === 'lidarr' || appLower === 'prowlarr' ? 'v1' : 'v3');
  }

  _sanitizeError(err) {
    if (!err) return 'Unknown error';
    const apiKey = this.apiKey;
    let msg = err.message || String(err);
    if (apiKey) {
      msg = msg.replace(new RegExp(apiKey, 'g'), '[masked]');
    }
    return msg;
  }

  /**
   * Make an API request
   * @private
   */
  async _request(endpoint, method = 'GET', body = null) {
    const url = `${this.apiUrl}/api/${this.apiVersion}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const options = {
            method: method,
            headers: {
                'X-Api-Key': this.apiKey,
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }

        // Handle cases where the response might be empty (e.g., 204 No Content)
        const text = await response.text();
        // Return null for empty responses, otherwise parse as JSON
        return text ? JSON.parse(text) : null;
    } finally {
        clearTimeout(timeoutId);
    }
  }

  /**
   * Get calendar entries for a date range
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Promise<Array>} Calendar entries
   */
  async getCalendar(start, end) {
    try {
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      const endpoint = `/calendar?start=${startStr}&end=${endStr}`;
      return await this._request(endpoint);
    } catch (error) {
      throw new Error(`Failed to get calendar for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get queue
   * @returns {Promise<Array>} Queue items
   */
  async getQueue() {
    try {
      const response = await this._request('/queue');
      // Queue endpoint returns an object with records array or direct array
      return response.records || response || [];
    } catch (error) {
      throw new Error(`Failed to get queue for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Remove a specific queue item
   * @param {number|string} id - Queue item id
   * @param {object} opts
   * @param {boolean} opts.removeFromClient - Also remove from download client
   * @param {boolean} opts.blocklist - Add to blocklist
   */
  async removeQueueItem(id, opts = {}) {
    const removeFromClient = opts.removeFromClient !== false; // default true
    const blocklist = opts.blocklist === true;
    try {
      // Most Servarr apps support DELETE /queue/{id}?removeFromClient=true&blocklist=false
      const endpoint = `/queue/${id}?removeFromClient=${removeFromClient}&blocklist=${blocklist}`;
      return await this._request(endpoint, 'DELETE');
    } catch (error) {
      throw new Error(`Failed to remove queue item for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get history (recent entries)
   * @param {number} pageSize - Number of entries to retrieve
   * @returns {Promise<Array>} History entries
   */
  async getHistory(pageSize = 5) {
    try {
      const endpoint = `/history?pageSize=${pageSize}&sortKey=date&sortDirection=descending`;
      const response = await this._request(endpoint);
      return response.records || response || [];
    } catch (error) {
      throw new Error(`Failed to get history for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Pause queue
   * Uses the command endpoint with Pause command
   */
  async pauseQueue() {
    try {
      // Servarr apps use the command endpoint to pause/resume
      // For Lidarr, we try 'Pause' but some versions might prefer 'PauseDownloadClient'
      // However, most modern Lidarr installations support 'Pause' as well.
      // To be safe and follow common practices for Homey integration:
      const commandName = this.appName === 'Lidarr' ? 'PauseDownloadClient' : 'Pause';
      
      const result = await this._request('/command', 'POST', { name: commandName });
      return result;
    } catch (error) {
      // Fallback: If 'PauseDownloadClient' fails for Lidarr, try 'Pause'
      if (this.appName === 'Lidarr' && error.message.includes('400')) {
        try {
          return await this._request('/command', 'POST', { name: 'Pause' });
        } catch (innerError) {
          throw new Error(`Failed to pause queue for ${this.appName}: ${this._sanitizeError(innerError)}`);
        }
      }
      throw new Error(`Failed to pause queue for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Resume queue. Uses the command endpoint with Resume command.
   */
  async resumeQueue() {
    try {
      const commandName = this.appName === 'Lidarr' ? 'ResumeDownloadClient' : 'Resume';
      const result = await this._request('/command', 'POST', { name: commandName });
      return result;
    } catch (error) {
      // Fallback: If 'ResumeDownloadClient' fails for Lidarr, try 'Resume'
      if (this.appName === 'Lidarr' && error.message.includes('400')) {
        try {
          return await this._request('/command', 'POST', { name: 'Resume' });
        } catch (innerError) {
          throw new Error(`Failed to resume queue for ${this.appName}: ${this._sanitizeError(innerError)}`);
        }
      }
      throw new Error(`Failed to resume queue for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get queue status (paused/resumed)
   */
  async getQueueStatus() {
    try {
      const status = await this._request('/queue/status');
      return status;
    } catch (error) {
      throw new Error(`Failed to get queue status for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Trigger search for missing items
   */
  async searchMissing() {
    const commandMap = {
      Radarr: 'MissingMoviesSearch',
      Sonarr: 'MissingEpisodeSearch',
      Lidarr: 'MissingAlbumSearch',
    };
    const commandName = commandMap[this.appName] || 'MissingMoviesSearch';
    try {
      return await this._request('/command', 'POST', { name: commandName });
    } catch (error) {
      throw new Error(`Failed to search missing for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this.getSystemStatus();
      return true;
    } catch (error) {
      throw new Error(`Connection failed for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus() {
    try {
      return await this._request('/system/status');
    } catch (error) {
      throw new Error(`Failed to get system status for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get indexers (Prowlarr specific)
   */
  async getIndexers() {
    if (this.appName !== 'Prowlarr') {
      throw new Error('getIndexers is only available for Prowlarr');
    }
    try {
      return await this._request('/indexer');
    } catch (error) {
      throw new Error(`Failed to get indexers for Prowlarr: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Execute a generic command
   * @param {string} name - Command name
   * @param {object} body - Command arguments
   */
  async executeCommand(name, body = {}) {
    try {
      return await this._request('/command', 'POST', { name, ...body });
    } catch (error) {
      throw new Error(`Failed to execute command ${name} for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get health status
   * @returns {Promise<Array>} Health check results
   */
  async getHealth() {
    try {
      const response = await this._request('/health');
      return response || [];
    } catch (error) {
      throw new Error(`Failed to get health for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get missing/wanted items
   * @param {number} pageSize - Number of items to retrieve (optional, for counting only)
   * @param {boolean} includeFuture - Whether to include future releases (default: false, only past releases)
   * @returns {Promise<Object>} Missing items with count and items array
   */
  async getMissing(pageSize = 100, includeFuture = false) {
    try {
      // Fetch enough items to filter by date
      const endpoint = `/wanted/missing?pageSize=${pageSize}`;
      const response = await this._request(endpoint);
      const items = response.records || response || [];
      
      if (!includeFuture) {
        // Filter out future releases - only count items that should have been released by now
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today
        
        const pastItems = items.filter(item => {
          // Check release date based on app type
          let releaseDate = null;
          
          if (this.appName === 'Radarr' && item.movie) {
            releaseDate = item.movie.releaseDate || item.movie.inCinemasDate || item.movie.digitalReleaseDate;
          } else if (this.appName === 'Sonarr' && item.episode) {
            releaseDate = item.episode.airDate || item.episode.airDateUtc;
          } else if (this.appName === 'Lidarr' && item.album) {
            releaseDate = item.album.releaseDate;
          }
          
          if (!releaseDate) return false; // Skip if no release date
          
          const release = new Date(releaseDate);
          release.setHours(0, 0, 0, 0);
          return release <= now; // Only count if release date is today or in the past
        });
        
        return { 
          count: pastItems.length, 
          items: pastItems,
          totalRecords: response.totalRecords !== undefined ? response.totalRecords : items.length
        };
      }
      
      // Return all items if includeFuture is true
      if (response.totalRecords !== undefined) {
        return { count: response.totalRecords, items: items, totalRecords: response.totalRecords };
      }
      return { count: items.length, items: items, totalRecords: items.length };
    } catch (error) {
      throw new Error(`Failed to get missing items for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Search for movies/series/artists by title
   * @param {string} title - Title to search for
   * @returns {Promise<Array>} Search results
   */
  async searchByTitle(title) {
    try {
      // Use the 'lookup' endpoint which is designed for searching by term.
      // This is vastly more efficient than fetching all items and filtering locally.
      const endpointMap = {
        Radarr: '/movie/lookup',
        Sonarr: '/series/lookup',
        Lidarr: '/artist/lookup',
      };
      const endpoint = endpointMap[this.appName] || '/movie/lookup';
      const searchUrl = `${endpoint}?term=${encodeURIComponent(title)}`;
      return await this._request(searchUrl);
    } catch (error) {
      throw new Error(`Failed to search for ${title} in ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Toggle monitored status for a movie/series/artist
   * @param {number} id - Item ID
   * @param {boolean} monitored - New monitored status
   * @returns {Promise<Object>} Updated item
   */
  async toggleMonitored(id, monitored) {
    try {
      const endpointMap = {
        Radarr: `/movie/${id}`,
        Sonarr: `/series/${id}`,
        Lidarr: `/artist/${id}`,
      };
      const endpoint = endpointMap[this.appName] || `/movie/${id}`;
      
      // First get current item
      const currentItem = await this._request(endpoint);
      
      // Update monitored status
      const updatedItem = { ...currentItem, monitored };
      
      // PUT update
      return await this._request(endpoint, 'PUT', updatedItem);
    } catch (error) {
      throw new Error(`Failed to toggle monitored status for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get library count (total movies/series/artists)
   * @returns {Promise<number>} Total count
   */
  async getLibraryCount() {
    try {
      const endpointMap = {
        Radarr: '/movie',
        Sonarr: '/series',
        Lidarr: '/artist',
      };
      const endpoint = endpointMap[this.appName] || '/movie';
      const response = await this._request(endpoint);
      if (Array.isArray(response)) {
        return response.length;
      }
      return response.totalRecords || response.length || 0;
    } catch (error) {
      throw new Error(`Failed to get library count for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

  /**
   * Get import list status
   * @returns {Promise<Array>} Import list status
   */
  async getImportListStatus() {
    try {
      const response = await this._request('/importlist');
      return Array.isArray(response) ? response : (response.records || []);
    } catch (error) {
      throw new Error(`Failed to get import list status for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

}

module.exports = ServarrAPI;
