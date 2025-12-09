'use strict';

const Homey = require('homey');
const ServarrAPI = require('../../lib/ServarrAPI');

/**
 * Servarr Control Hub Device
 * 
 * This device aggregates data from multiple Servarr applications (Radarr, Sonarr, Lidarr)
 * and provides monitoring capabilities and Flow integration.
 * 
 * Performance optimizations:
 * - Polling interval: 5 minutes for most data
 * - Efficient API calls with minimal data transfer
 * - Cached results where possible
 */
class ServarrHubDevice extends Homey.Device {

  async onInit() {
    this.log('Servarr Hub Device has been initialized');
    
    // Initialize API clients
    this._apiClients = {};
    this._pollingInterval = null;
    this._lastQueueCount = 0;
    this._lastDownloadStates = new Map();
    
    // Initialize capabilities with default values
    if (!this.hasCapability('text_today_releases')) {
      await this.addCapability('text_today_releases');
    }
    if (!this.hasCapability('measure_queue_count')) {
      await this.addCapability('measure_queue_count');
    }
    
    // Set initial values
    await this.setCapabilityValue('text_today_releases', '0');
    await this.setCapabilityValue('measure_queue_count', 0);
    
    // Load configuration
    await this.loadConfiguration();
    
    // Start polling
    this.startPolling();
    
    // Register capabilities (read-only, no action needed)
    this.registerCapabilityListener('text_today_releases', async () => {
      // Read-only capability
    });
    
    this.registerCapabilityListener('measure_queue_count', async () => {
      // Read-only capability
    });
  }

  /**
   * Load configuration from device settings
   * Only initializes clients for enabled apps
   */
  async loadConfiguration() {
    const settings = this.getSettings();
    
    // Clear existing clients
    this._apiClients = {};
    
    // Initialize Radarr client if enabled and configured
    if (settings.radarr_enabled && settings.radarr_url && settings.radarr_api_key) {
      try {
        this._apiClients.radarr = new ServarrAPI({
          baseUrl: settings.radarr_url,
          port: settings.radarr_port || 7878,
          apiKey: settings.radarr_api_key,
          appName: 'Radarr'
        });
        this.log('Radarr client initialized');
      } catch (error) {
        this.error('Failed to initialize Radarr client:', error);
      }
    }
    
    // Initialize Sonarr client if enabled and configured
    if (settings.sonarr_enabled && settings.sonarr_url && settings.sonarr_api_key) {
      try {
        this._apiClients.sonarr = new ServarrAPI({
          baseUrl: settings.sonarr_url,
          port: settings.sonarr_port || 8989,
          apiKey: settings.sonarr_api_key,
          appName: 'Sonarr'
        });
        this.log('Sonarr client initialized');
      } catch (error) {
        this.error('Failed to initialize Sonarr client:', error);
      }
    }
    
    // Initialize Lidarr client if enabled and configured
    if (settings.lidarr_enabled && settings.lidarr_url && settings.lidarr_api_key) {
      try {
        this._apiClients.lidarr = new ServarrAPI({
          baseUrl: settings.lidarr_url,
          port: settings.lidarr_port || 8686,
          apiKey: settings.lidarr_api_key,
          appName: 'Lidarr'
        });
        this.log('Lidarr client initialized');
      } catch (error) {
        this.error('Failed to initialize Lidarr client:', error);
      }
    }
    
    const enabledCount = Object.keys(this._apiClients).length;
    this.log(`Loaded configuration for ${enabledCount} enabled Servarr app(s)`);
    
    if (enabledCount === 0) {
      this.setUnavailable('No Servarr applications enabled');
    } else {
      this.setAvailable();
    }
  }

  /**
   * Start polling for updates
   * Polls every 5 minutes as per performance requirements
   */
  startPolling() {
    // Initial update
    this.updateData();
    
    // Set up polling interval (5 minutes = 300000 ms)
    this._pollingInterval = setInterval(() => {
      this.updateData();
    }, 300000);
    
    this.log('Started polling (interval: 5 minutes)');
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = null;
      this.log('Stopped polling');
    }
  }

  /**
   * Update all device data
   * This is called periodically and on demand
   */
  async updateData() {
    try {
      // If no clients configured/enabled, skip heavy work
      if (Object.keys(this._apiClients).length === 0) {
        this.log('No Servarr apps enabled; skipping update');
        return;
      }

      // Update today's releases
      await this.updateTodayReleases();
      
      // Update queue count and get previous count for comparison
      const queueInfo = await this.updateQueueCount();
      
      // Check if queue is empty (compare previous with current)
      if (queueInfo.previous > 0 && queueInfo.current === 0) {
        const trigger = this.driver._queueEmptyTrigger;
        await trigger.trigger(this, {}, {});
        this.log('Queue is now empty');
      }
      
      // Check for finished downloads
      await this.checkFinishedDownloads();
      
    } catch (error) {
      this.error('Error updating device data:', error);
    }
  }

  /**
   * Update today's releases count
   */
  async updateTodayReleases() {
    let totalReleases = 0;
    const releases = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        const calendar = await client.getCalendar(today, tomorrow);
        totalReleases += calendar.length;

        // Map calendar entries to a simplified structure for the widget
        for (const item of calendar) {
          const title =
            item.title ||
            item.series?.title ||
            item.movie?.title ||
            item.album?.title ||
            item.artist?.artistName ||
            item.sourceTitle ||
            'Unknown';

          const hasFile = !!item.hasFile;

          releases.push({
            app: appName,
            title,
            hasFile,
          });
        }
      } catch (error) {
        this.error(`Error fetching calendar for ${appName}:`, error);
      }
    }
    
    await this.setCapabilityValue('text_today_releases', totalReleases.toString());
    // Store detailed releases for widget rendering (keep it small)
    await this.setStoreValue('today_releases', releases.slice(0, 100));
    this.log(`Today's releases: ${totalReleases}`);
  }

  /**
   * Update queue count
   */
  async updateQueueCount() {
    let totalQueue = 0;
    const queueItems = [];
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        const queue = await client.getQueue();
        totalQueue += queue.length;

        for (const item of queue) {
          const title =
            item.title ||
            item.series?.title ||
            item.movie?.title ||
            item.artist?.artistName ||
            item.sourceTitle ||
            'Unknown';

          queueItems.push({
            id: item.id || item.queueId || item.downloadId || item.trackedDownloadId || '',
            app: appName,
            title,
            status: item.status || item.trackedDownloadStatus || 'queued',
            size: item.size || item.sizeleft || null,
            timeLeft: item.timeleft || item.estimatedCompletionTime || null,
          });
        }
      } catch (error) {
        this.error(`Error fetching queue for ${appName}:`, error);
      }
    }
    
    // Store previous count before updating
    const previousCount = this._lastQueueCount;
    
    await this.setCapabilityValue('measure_queue_count', totalQueue);
    await this.setStoreValue('queue_items', queueItems.slice(0, 100));
    this._lastQueueCount = totalQueue;
    this.log(`Total queue count: ${totalQueue}`);
    
    // Return previous count for queue empty check
    return { current: totalQueue, previous: previousCount };
  }

  /**
   * Check for finished downloads and trigger Flow cards
   */
  async checkFinishedDownloads() {
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        const history = await client.getHistory(20); // Get recent history (last 20 items)
        
        for (const item of history) {
          const downloadId = `${appName}_${item.id || item.eventType}_${item.date}`;
          
          // Check if this is a completed download event
          // Servarr apps use different event types: 'downloadFolderImported', 'grabbed', etc.
          const isCompleted = item.eventType === 'downloadFolderImported' || 
                             item.eventType === 'DownloadFolderImported' ||
                             (item.eventType === 'grabbed' && item.data && item.data.downloadClient === 'completed');
          
          if (isCompleted) {
            // Check if we've already triggered for this download
            if (!this._lastDownloadStates.has(downloadId) || 
                this._lastDownloadStates.get(downloadId).status !== 'completed') {
              
              // Extract title based on app type
              let title = 'Unknown';
              if (item.movie) title = item.movie.title || item.movie.title;
              else if (item.series) title = `${item.series.title} - ${item.episode ? item.episode.title : ''}`;
              else if (item.artist) title = `${item.artist.artistName} - ${item.album ? item.album.title : ''}`;
              else if (item.sourceTitle) title = item.sourceTitle;
              else if (item.title) title = item.title;
              
              // Trigger download finished flow
              const trigger = this.driver._downloadFinishedTrigger;
              await trigger.trigger(this, {
                title: title,
                app: appName
              }, {});
              
              this.log(`Download finished: ${title} (${appName})`);
              
              // Mark as completed
              this._lastDownloadStates.set(downloadId, {
                status: 'completed',
                title: title,
                timestamp: Date.now()
              });
            }
          }
          
          // Clean up old states (keep only last 100)
          if (this._lastDownloadStates.size > 100) {
            const entries = Array.from(this._lastDownloadStates.entries());
            entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
            this._lastDownloadStates.clear();
            entries.slice(0, 100).forEach(([key, value]) => {
              this._lastDownloadStates.set(key, value);
            });
          }
        }
      } catch (error) {
        this.error(`Error checking downloads for ${appName}:`, error);
      }
    }
  }


  /**
   * Pause all Servarr downloads
   */
  async pauseAllDownloads() {
    const results = [];
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        await client.pauseQueue();
        results.push({ app: appName, success: true });
        this.log(`Paused downloads for ${appName}`);
      } catch (error) {
        this.error(`Error pausing ${appName}:`, error);
        results.push({ app: appName, success: false, error: error.message });
      }
    }
    
    // Force immediate queue update
    await this.updateQueueCount();
    
    return results;
  }

  /**
   * Resume all Servarr downloads
   */
  async resumeAllDownloads() {
    const results = [];
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        await client.resumeQueue();
        results.push({ app: appName, success: true });
        this.log(`Resumed downloads for ${appName}`);
      } catch (error) {
        this.error(`Error resuming ${appName}:`, error);
        results.push({ app: appName, success: false, error: error.message });
      }
    }
    
    // Force immediate queue update
    await this.updateQueueCount();
    
    return results;
  }

  /**
   * Pause downloads for a specific app
   */
  async pauseAppDownloads(appName) {
    const client = this._apiClients[appName];
    
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }
    
    try {
      await client.pauseQueue();
      this.log(`Paused downloads for ${appName}`);
      
      // Force immediate queue update
      await this.updateQueueCount();
      
      return { success: true };
    } catch (error) {
      this.error(`Error pausing ${appName}:`, error);
      throw error;
    }
  }

  /**
   * Remove a queue item for a specific app
   */
  async removeQueueItem(appName, queueId, { blocklist = false } = {}) {
    const client = this._apiClients[appName];
    
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }
    
    try {
      await client.removeQueueItem(queueId, {
        removeFromClient: true,
        blocklist,
      });
      // Refresh queue
      await this.updateQueueCount();
      return { success: true };
    } catch (error) {
      this.error(`Error removing queue item ${queueId} for ${appName}:`, error);
      throw error;
    }
  }

  /**
   * Handle settings update
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('Settings updated, reloading configuration');
    
    // Stop current polling
    this.stopPolling();
    
    // Reload configuration
    await this.loadConfiguration();
    
    // Restart polling
    this.startPolling();
    
    // Force immediate update
    await this.updateData();
  }

  /**
   * Cleanup on device removal
   */
  async onDeleted() {
    this.stopPolling();
    this.log('Servarr Hub Device has been deleted');
  }

}

module.exports = ServarrHubDevice;

