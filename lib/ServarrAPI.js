'use strict';

const Homey = require('homey');
const https = require('https');
const http = require('http');

/**
 * Servarr API Client
 * 
 * Lightweight API client for communicating with Servarr applications (Radarr, Sonarr, Lidarr).
 * Optimized for minimal resource usage.
 */
class ServarrAPI {

  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.port = config.port;
    this.apiKey = config.apiKey;
    this.appName = config.appName;
    
    // Parse base URL
    const urlMatch = this.baseUrl.match(/^(https?):\/\/(.+)$/);
    if (!urlMatch) {
      throw new Error(`Invalid base URL: ${this.baseUrl}`);
    }
    
    this.protocol = urlMatch[1];
    this.hostname = urlMatch[2];
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
  async _request(endpoint, method = 'GET', body = null, attempt = 0) {
    return new Promise((resolve, reject) => {
      const url = `/api/v3${endpoint}`;
      const options = {
        hostname: this.hostname,
        port: this.port,
        path: url,
        method: method,
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      };

      const client = this.protocol === 'https' ? https : http;
      
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const jsonData = data ? JSON.parse(data) : null;
              resolve(jsonData);
            } catch (error) {
              resolve(data);
            }
          } else {
            // Retry once on 5xx
            if (res.statusCode >= 500 && attempt === 0) {
              setTimeout(() => {
                this._request(endpoint, method, body, attempt + 1).then(resolve).catch(reject);
              }, 300);
              return;
            }
            reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}`));
          }
        });
      });
      
      req.on('error', (error) => {
        // Retry once on network errors
        if (attempt === 0) {
          setTimeout(() => {
            this._request(endpoint, method, body, attempt + 1).then(resolve).catch(reject);
          }, 300);
          return;
        }
        reject(error);
      });
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      
      req.end();
    });
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
      // Command name varies: 'Pause' for Sonarr/Radarr, 'PauseDownloadClient' for Lidarr
      const command = {
        name: 'Pause'
      };
      const result = await this._request('/command', 'POST', command);
      
      // If that doesn't work, try alternative endpoint
      if (!result) {
        // Try queue pause endpoint (some versions use this)
        return await this._request('/queue/pause', 'POST');
      }
      
      return result;
    } catch (error) {
      // Try alternative method if first fails
      try {
        return await this._request('/queue/pause', 'POST');
      } catch (error2) {
        throw new Error(`Failed to pause queue for ${this.appName}: ${this._sanitizeError(error)}`);
      }
    }
  }

  /**
   * Resume queue
   * Uses the command endpoint with Resume command
   */
  async resumeQueue() {
    try {
      const command = {
        name: 'Resume'
      };
      const result = await this._request('/command', 'POST', command);
      
      // If that doesn't work, try alternative endpoint
      if (!result) {
        return await this._request('/queue/resume', 'POST');
      }
      
      return result;
    } catch (error) {
      // Try alternative method if first fails
      try {
        return await this._request('/queue/resume', 'POST');
      } catch (error2) {
        throw new Error(`Failed to resume queue for ${this.appName}: ${this._sanitizeError(error)}`);
      }
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this._request('/system/status');
      return true;
    } catch (error) {
      return false;
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
   * @returns {Promise<Array>} Missing items
   */
  async getMissing(pageSize = 1) {
    try {
      // Use pageSize=1 to minimize data transfer (we only need the count)
      const endpoint = `/wanted/missing?pageSize=${pageSize}`;
      const response = await this._request(endpoint);
      // Response has totalRecords for count, or we can use records.length
      if (response.totalRecords !== undefined) {
        return { count: response.totalRecords, items: response.records || [] };
      }
      return { count: (response.records || response || []).length, items: response.records || response || [] };
    } catch (error) {
      throw new Error(`Failed to get missing items for ${this.appName}: ${this._sanitizeError(error)}`);
    }
  }

}

module.exports = ServarrAPI;

