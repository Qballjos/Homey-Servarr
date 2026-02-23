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
    this._healthCheckInterval = null;
    this._lastQueueCount = 0;
    this._lastDownloadStates = new Map();
    this._lastAddedStates = new Map();
    this._appErrors = {};
    this._lastHealthStatus = {}; // Track health status per app
    
    // Initialize capabilities with default values
    const capabilities = [
      'measure_today_releases',
      'measure_queue_count',
      'measure_missing_count',
      'queue_paused',
      'measure_library_size',
      'measure_radarr_releases',
      'measure_sonarr_releases',
      'measure_lidarr_releases',
      'measure_radarr_missing',
      'measure_sonarr_missing',
      'measure_lidarr_missing',
      'measure_prowlarr_indexers',
      'measure_prowlarr_indexers_down'
    ];
    
    for (const cap of capabilities) {
      if (!this.hasCapability(cap)) {
        await this.addCapability(cap);
      }
    }
    
    // Set initial values
    await this.setCapabilityValue('measure_today_releases', 0);
    await this.setCapabilityValue('measure_queue_count', 0);
    await this.setCapabilityValue('measure_missing_count', 0);
    await this.setCapabilityValue('queue_paused', false);
    await this.setCapabilityValue('measure_library_size', 0);
    await this.setCapabilityValue('measure_radarr_releases', 0);
    await this.setCapabilityValue('measure_sonarr_releases', 0);
    await this.setCapabilityValue('measure_lidarr_releases', 0);
    await this.setCapabilityValue('measure_radarr_missing', 0);
    await this.setCapabilityValue('measure_sonarr_missing', 0);
    await this.setCapabilityValue('measure_lidarr_missing', 0);
    await this.setCapabilityValue('measure_prowlarr_indexers', 0);
    await this.setCapabilityValue('measure_prowlarr_indexers_down', 0);
    
    // Load configuration
    await this.loadConfiguration();
    
    // Start polling
    this.startPolling();
  }

  /**
   * Cleanup when device is uninitialized
   */
  async onUninit() {
    this.stopPolling();
    this.log('Servarr Hub Device has been uninitialized');
  }

  /**
   * Load configuration from device settings
   * Only initializes clients for enabled apps
   */
  async loadConfiguration() {
    const settings = this.getSettings();
    this._manualOnly = settings.manual_refresh_only || false;
    
    // Clear existing clients
    this._apiClients = {};
    this._appErrors = {};
    
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

    // Initialize Prowlarr client if enabled and configured
    if (settings.prowlarr_enabled && settings.prowlarr_url && settings.prowlarr_api_key) {
      try {
        this._apiClients.prowlarr = new ServarrAPI({
          baseUrl: settings.prowlarr_url,
          port: settings.prowlarr_port || 9696,
          apiKey: settings.prowlarr_api_key,
          appName: 'Prowlarr'
        });
        this.log('Prowlarr client initialized');
      } catch (error) {
        this.error('Failed to initialize Prowlarr client:', error);
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
    
    // Manual-only mode skips interval polling
    if (this._manualOnly) {
      this.log('Manual refresh only; skipping polling interval');
      return;
    }
    
    // Set up polling interval (5 minutes = 300000 ms)
    // Use Homey's setInterval for automatic cleanup
    this._pollingInterval = this.homey.setInterval(() => {
      this.updateData();
    }, 300000);
    
    // Set up health check interval (15 minutes = 900000 ms)
    // Use Homey's setInterval for automatic cleanup
    this._healthCheckInterval = this.homey.setInterval(() => {
      this.checkHealth();
      this.updateMissingCount();
      this.updateLibrarySize();
      this.updateCalendarData(); // Update calendar data periodically
      this.updateProwlarrStatus(); // Update Prowlarr indexers periodically
    }, 900000);
    
    // Initial health check, missing count, library size, calendar data, and Prowlarr status
    this.checkHealth();
    this.updateMissingCount();
    this.updateLibrarySize();
    this.updateCalendarData();
    this.updateProwlarrStatus();
    
    this.log('Started polling (interval: 5 minutes, health/missing/library: 15 minutes)');
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this._pollingInterval) {
      this.homey.clearInterval(this._pollingInterval);
      this._pollingInterval = null;
    }
    if (this._healthCheckInterval) {
      this.homey.clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = null;
    }
    this.log('Stopped polling');
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
        const trigger = this.homey.app.queueEmptyTrigger;
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
      // Prowlarr doesn't have a calendar endpoint
      if (appName === 'prowlarr') continue;
      try {
        const calendar = await client.getCalendar(today, tomorrow);
        totalReleases += calendar.length;

        // Map calendar entries to a simplified structure for the widget
        for (const item of calendar) {
          let title =
            item.title ||
            item.series?.title ||
            item.movie?.title ||
            item.album?.title ||
            item.artist?.artistName ||
            item.sourceTitle ||
            'Unknown';

          // Truncate long titles to save memory
          if (title.length > 40) {
            title = title.substring(0, 37) + '...';
          }

          releases.push({
            app: appName,
            title,
            hasFile: !!item.hasFile,
          });
        }
        this._clearAppError(appName);
      } catch (error) {
        this.error(`Error fetching calendar for ${appName}: ${error.message || error}`);
        this._setAppError(appName, (error.message || 'Calendar error').substring(0, 100));
      }
    }
    
    // Store detailed releases for widget rendering (keep it small)
    await this.setStoreValue('today_releases', releases.slice(0, 100));
    
    // Store per-app release counts for widgets & panel view
    const perAppReleases = { radarr: 0, sonarr: 0, lidarr: 0 };
    for (const r of releases) {
      if (perAppReleases.hasOwnProperty(r.app)) {
        perAppReleases[r.app]++;
      }
    }
    await this.setStoreValue('app_release_counts', perAppReleases);
    
    // Update per-app release capabilities
    await this.setCapabilityValue('measure_radarr_releases', perAppReleases.radarr);
    await this.setCapabilityValue('measure_sonarr_releases', perAppReleases.sonarr);
    await this.setCapabilityValue('measure_lidarr_releases', perAppReleases.lidarr);
    
    // Update text capability with total
    await this.setCapabilityValue('measure_today_releases', totalReleases);
    
    await this.setStoreValue('app_errors', this._serializeErrors());
    this.log(`Today's releases: ${totalReleases} (Radarr: ${perAppReleases.radarr}, Sonarr: ${perAppReleases.sonarr}, Lidarr: ${perAppReleases.lidarr})`);
  }

  /**
   * Update calendar data for a wider date range (for calendar widget)
   * Fetches calendar for current month +/- 1 month
   */
  async updateCalendarData() {
    const calendarData = [];
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    end.setHours(23, 59, 59, 999);
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have a calendar endpoint
      if (appName === 'prowlarr') continue;
      try {
        const calendar = await client.getCalendar(start, end);
        
        for (const item of calendar) {
          let title =
            item.title ||
            item.series?.title ||
            item.movie?.title ||
            item.album?.title ||
            item.artist?.artistName ||
            item.sourceTitle ||
            'Unknown';

          if (title.length > 40) {
            title = title.substring(0, 37) + '...';
          }

          const hasFile = !!item.hasFile;
          // Servarr APIs return dates in various formats
          const releaseDate = item.airDate || 
                             item.releaseDate || 
                             item.releaseDateUtc ||
                             item.inCinemas ||
                             item.physicalRelease ||
                             item.digitalRelease;
          
          if (releaseDate) {
            const date = new Date(releaseDate);
            // Only add if date is valid
            if (!isNaN(date.getTime())) {
              calendarData.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD format
                title,
                app: appName,
                hasFile,
                timestamp: date.getTime()
              });
            }
          }
        }
        this._clearAppError(appName);
      } catch (error) {
        this.error(`Error fetching calendar data for ${appName}: ${error.message || error}`);
        this._setAppError(appName, (error.message || 'Calendar data error').substring(0, 100));
      }
    }
    
    // Store calendar data grouped by date
    await this.setStoreValue('calendar_data', calendarData);
    this.log(`Updated calendar data: ${calendarData.length} releases`);
  }

  /**
   * Update queue count
   */
  async updateQueueCount() {
    let totalQueue = 0;
    const queueItems = [];
    const perAppCounts = { radarr: 0, sonarr: 0, lidarr: 0 };
    const pausedApps = [];
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have queue endpoints
      if (appName === 'prowlarr') continue;
      try {
        // Queue status (paused)
        const status = await client.getQueueStatus();
        if (status && status.isPaused) {
          pausedApps.push(appName);
        }

        const queue = await client.getQueue();
        totalQueue += queue.length;
        if (perAppCounts[appName] !== undefined) {
          perAppCounts[appName] = queue.length;
        }

        // Map queue records to simplified objects to save memory
        const simplifiedRecords = queue.map(item => {
          let title =
            item.title ||
            item.series?.title ||
            item.movie?.title ||
            item.artist?.artistName ||
            item.sourceTitle ||
            'Unknown';
          if (title.length > 40) {
            title = title.substring(0, 37) + '...';
          }
          
          return {
            id: item.id || item.queueId || item.downloadId || item.trackedDownloadId || '',
            app: appName,
            title,
            status: item.status || item.trackedDownloadStatus || 'queued',
            size: item.size || item.sizeleft || null,
            timeLeft: item.timeleft || item.estimatedCompletionTime || null,
          };
        });
        
        queueItems.push(...simplifiedRecords);
        this._clearAppError(appName);
      } catch (error) {
        this.error(`Error fetching queue for ${appName}: ${error.message || error}`);
        this._setAppError(appName, (error.message || 'Queue error').substring(0, 100));
      }
    }
    
    // Store previous count before updating
    const previousCount = this._lastQueueCount;
    
    await this.setCapabilityValue('measure_queue_count', totalQueue);
    await this.setStoreValue('queue_items', queueItems.slice(0, 100));
    await this.setStoreValue('app_errors', this._serializeErrors());
    await this.setStoreValue('queue_app_counts', perAppCounts);
    await this.setStoreValue('queue_paused_apps', pausedApps);
    await this.setCapabilityValue('queue_paused', pausedApps.length > 0);
    this._lastQueueCount = totalQueue;
    this.log(`Total queue count: ${totalQueue}`);
    
    // Return previous count for queue empty check
    return { current: totalQueue, previous: previousCount };
  }

  /**
   * Update missing items count
   * Only counts past releases (not future ones)
   * Polls every 15 minutes (same interval as health check)
   */
  async updateMissingCount() {
    let totalMissing = 0;
    const perAppMissing = { radarr: 0, sonarr: 0, lidarr: 0 };

    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have a wanted/missing endpoint
      if (appName === 'prowlarr') continue;
      try {
        // Fetch missing items and filter out future releases (only count past releases)
        const result = await client.getMissing(100, false); // pageSize=100, includeFuture=false
        const count = result.count || 0;
        totalMissing += count;
        if (perAppMissing.hasOwnProperty(appName)) {
          perAppMissing[appName] = count;
        }
        this._clearAppError(appName);
      } catch (error) {
        this.error(`Error getting missing items for ${appName}: ${error.message || error}`);
        this._setAppError(appName, error.message || 'Missing items error');
      }
    }

    await this.setCapabilityValue('measure_missing_count', totalMissing);
    await this.setStoreValue('app_missing_counts', perAppMissing);
    
    // Update per-app missing capabilities
    await this.setCapabilityValue('measure_radarr_missing', perAppMissing.radarr);
    await this.setCapabilityValue('measure_sonarr_missing', perAppMissing.sonarr);
    await this.setCapabilityValue('measure_lidarr_missing', perAppMissing.lidarr);
    
    this.log(`Total missing items (past only): ${totalMissing} (Radarr: ${perAppMissing.radarr}, Sonarr: ${perAppMissing.sonarr}, Lidarr: ${perAppMissing.lidarr})`);
  }


  /**
   * Update library size (total movies/series/albums)
   * Polls every 15 minutes (same interval as health check)
   */
  async updateLibrarySize() {
    let totalLibrarySize = 0;
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have a library endpoint
      if (appName === 'prowlarr') continue;
      try {
        const count = await client.getLibraryCount();
        totalLibrarySize += count;
        this._clearAppError(appName);
      } catch (error) {
        this.error(`Error getting library count for ${appName}: ${error.message || error}`);
        this._setAppError(appName, error.message || 'Library count error');
      }
    }
    
    await this.setCapabilityValue('measure_library_size', totalLibrarySize);
    this.log(`Total library size: ${totalLibrarySize}`);
  }

  /**
   * Check health status for all apps
   * Polls every 15 minutes, triggers Flow card on new errors/warnings
   */
  async checkHealth() {
    for (const [appName, client] of Object.entries(this._apiClients)) {
      try {
        const health = await client.getHealth();
        const currentIssues = health.filter(h => h.type === 'error' || h.type === 'warning');
        
        // Get previous issues for this app
        const previousIssues = this._lastHealthStatus[appName] || [];
        const previousIssueIds = new Set(previousIssues.map(h => h.id || h.message));
        
        // Trigger for new issues only
        for (const issue of currentIssues) {
          const issueId = issue.id || issue.message;
          if (!previousIssueIds.has(issueId)) {
            // New issue detected, trigger Flow card
            const trigger = this.homey.app.healthCheckFailedTrigger;
            await trigger.trigger(this, {
              app: appName,
              message: issue.message || issue.source || 'Health check issue',
              type: issue.type || 'warning'
            }, {});
            this.log(`Health check failed for ${appName}: ${issue.message || issue.source}`);
          }
        }
        
        // Update stored health status
        this._lastHealthStatus[appName] = currentIssues;
      } catch (error) {
        this.error(`Error checking health for ${appName}: ${error.message || error}`);
        // Don't trigger on API errors (handled by app_errors)
      }
    }

    // Generate unified health summary for the widget
    const summary = {};
    for (const appName of ['radarr', 'sonarr', 'lidarr', 'prowlarr']) {
      const client = this._apiClients[appName];
      if (!client) {
        summary[appName] = { status: 'disabled' };
        continue;
      }

      const issues = this._lastHealthStatus[appName] || [];
      const appErr = this._appErrors[appName];

      if (appErr) {
        summary[appName] = { status: 'error', message: appErr.message };
      } else if (issues.some(i => i.type === 'error')) {
        summary[appName] = { status: 'error', message: 'Internal application error' };
      } else if (issues.some(i => i.type === 'warning')) {
        summary[appName] = { status: 'warning', message: 'Application warning' };
      } else {
        summary[appName] = { status: 'ok' };
      }
    }
    await this.setStoreValue('health_summary', summary);
  }

  /**
   * Check for finished downloads and trigger Flow cards
   */
  async checkFinishedDownloads() {
    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have a history endpoint
      if (appName === 'prowlarr') continue;
      // Load persistent history of triggered events
      let triggeredDownloadIds = (await this.getStoreValue('triggeredDownloadIds')) || [];
      let triggeredAddedIds = (await this.getStoreValue('triggeredAddedIds')) || [];
      let triggeredGrabIds = (await this.getStoreValue('triggeredGrabIds')) || [];

      try {
        const history = await client.getHistory(20); // Get recent history (last 20 items)
        
        for (const item of history) {
          const downloadId = `${appName}_${item.id || item.eventType}_${item.date}`;
          const addedId = `${appName}_added_${item.id || item.eventType}_${item.date}`;
          const grabId = `${appName}_grab_${item.id || item.eventType}_${item.date}`;
          
          // Check if this is a grabbed event
          const isGrabbed = item.eventType === 'grabbed' || item.eventType === 'Grabbed' ||
                           (item.data && item.data.reason === 'grabbed');
          
          if (isGrabbed && !triggeredGrabIds.includes(grabId)) {
            // Extract title
            let title = this._extractTitle(item);
            
            // Trigger grab flow
            const trigger = this.homey.app.grabEventTrigger;
            await trigger.trigger(this, {
              title: title,
              app: appName
            }, {});
            
            this.log(`Release grabbed: ${title} (${appName})`);
            
            triggeredGrabIds.push(grabId);
            if (triggeredGrabIds.length > 100) triggeredGrabIds.shift();
          }

          // Check if this is a completed download event
          // Servarr apps use different event types: 'downloadFolderImported', 'grabbed', etc.
          const isCompleted = item.eventType === 'downloadFolderImported' || 
                             item.eventType === 'DownloadFolderImported' ||
                             (item.eventType === 'grabbed' && item.data && item.data.downloadClient === 'completed');
          
          if (isCompleted) {
            // Check if we've already triggered for this download
            if (!triggeredDownloadIds.includes(downloadId)) {
              
              // Extract title based on app type
              let title = 'Unknown';
              if (item.movie) title = item.movie.title || item.movie.title;
              else if (item.series) title = `${item.series.title} - ${item.episode ? item.episode.title : ''}`;
              else if (item.artist) title = `${item.artist.artistName} - ${item.album ? item.album.title : ''}`;
              else if (item.sourceTitle) title = item.sourceTitle;
              else if (item.title) title = item.title;
              
              // Trigger download finished flow
              const trigger = this.homey.app.downloadFinishedTrigger;
              await trigger.trigger(this, {
                title: title,
                app: appName
              }, {});
              
              this.log(`Download finished: ${title} (${appName})`);
              
              // Add to persistent log and rotate
              triggeredDownloadIds.push(downloadId);
              if (triggeredDownloadIds.length > 100) triggeredDownloadIds.shift();
            }
          }

          // Detect newly added media events (lightweight)
          const eventType = (item.eventType || '').toLowerCase();
          const isMediaAdded = eventType.includes('movieadded') ||
                               eventType.includes('seriesadded') ||
                               eventType.includes('artistadded') ||
                               eventType.includes('albumadded');

          if (isMediaAdded) {
            if (!triggeredAddedIds.includes(addedId)) {
              let title = 'Unknown';
              let mediaType = 'movie';
              if (item.movie) {
                title = item.movie.title || title;
                mediaType = 'movie';
              } else if (item.series) {
                title = item.series.title || title;
                mediaType = 'series';
              } else if (item.artist) {
                title = item.artist.artistName || title;
                mediaType = 'artist';
              } else if (item.album) {
                title = item.album.title || title;
                mediaType = 'album';
              } else if (item.sourceTitle) {
                title = item.sourceTitle;
              } else if (item.title) {
                title = item.title;
              }

              const trigger = this.homey.app.mediaAddedTrigger;
              await trigger.trigger(this, {
                title,
                app: appName,
                type: mediaType,
              }, {});

              this.log(`Media added: ${title} (${mediaType}) via ${appName}`);

              // Add to persistent log and rotate
              triggeredAddedIds.push(addedId);
              if (triggeredAddedIds.length > 100) triggeredAddedIds.shift();
            }
          }
        }
        this._clearAppError(appName);
        // Save the updated persistent logs
        await this.setStoreValue('triggeredDownloadIds', triggeredDownloadIds);
        await this.setStoreValue('triggeredAddedIds', triggeredAddedIds);
        await this.setStoreValue('triggeredGrabIds', triggeredGrabIds);
      } catch (error) {
        this.error(`Error checking downloads for ${appName}: ${error.message || error}`);
        this._setAppError(appName, error.message || 'History error');
      }
    }
  }


  /**
   * Pause all Servarr downloads
   */
  async pauseAllDownloads() {
    const results = [];
    
    for (const [appName, client] of Object.entries(this._apiClients)) {
      // Prowlarr doesn't have queue management
      if (appName === 'prowlarr') continue;
      try {
        await client.pauseQueue();
        results.push({ app: appName, success: true });
        this.log(`Paused downloads for ${appName}`);
      } catch (error) {
        this.error(`Error pausing ${appName}: ${error.message || error}`);
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
      // Prowlarr doesn't have queue management
      if (appName === 'prowlarr') continue;
      try {
        await client.resumeQueue();
        results.push({ app: appName, success: true });
        this.log(`Resumed downloads for ${appName}`);
      } catch (error) {
        this.error(`Error resuming ${appName}: ${error.message || error}`);
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
      this.error(`Error pausing ${appName}: ${error.message || error}`);
      throw error;
    }
  }

  /**
   * Resume downloads for a specific app
   */
  async resumeAppDownloads(appName) {
    const client = this._apiClients[appName];
    
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }
    
    try {
      await client.resumeQueue();
      this.log(`Resumed downloads for ${appName}`);
      
      // Force immediate queue update
      await this.updateQueueCount();
      
      return { success: true };
    } catch (error) {
      this.error(`Error resuming ${appName}: ${error.message || error}`);
      throw error;
    }
  }

  /**
   * Search missing items for a specific app
   */
  async searchMissing(appName) {
    const client = this._apiClients[appName];
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }

    try {
      await client.searchMissing();
      this.log(`Triggered missing search for ${appName}`);
      return { success: true };
    } catch (error) {
      this.error(`Error searching missing for ${appName}: ${error.message || error}`);
      throw error;
    }
  }

  /**
   * Toggle monitored status for a media item
   */
  async toggleMonitoredStatus(appName, title, monitored) {
    const client = this._apiClients[appName];
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }

    try {
      // Search for item by title
      const results = await client.searchByTitle(title);
      if (results.length === 0) {
        throw new Error(`No item found with title "${title}" in ${appName}`);
      }
      
      // Use first match (could be improved with better matching)
      const item = results[0];
      const itemId = item.id || item.movieId || item.seriesId || item.artistId;
      
      if (!itemId) {
        throw new Error(`Item found but no ID available for ${title}`);
      }
      
      // Toggle monitored status
      await client.toggleMonitored(itemId, monitored);
      this.log(`Toggled monitored status for ${title} in ${appName} to ${monitored}`);
      return { success: true, title, monitored };
    } catch (error) {
      this.error(`Error toggling monitored status for ${title} in ${appName}: ${error.message || error}`);
      throw error;
    }
  }

  _setAppError(appName, message) {
    this._appErrors[appName] = { message, timestamp: Date.now() };
  }

  _clearAppError(appName) {
    delete this._appErrors[appName];
  }

  /**
   * Helper to extract title from history item
   */
  _extractTitle(item) {
    let title = 'Unknown';
    if (item.movie) title = item.movie.title || item.movie.title;
    else if (item.series) title = `${item.series.title}${item.episode ? ' - ' + item.episode.title : ''}`;
    else if (item.artist) title = `${item.artist.artistName}${item.album ? ' - ' + item.album.title : ''}`;
    else if (item.sourceTitle) title = item.sourceTitle;
    else if (item.title) title = item.title;
    return title;
  }

  /**
   * Update Prowlarr specific status
   */
  async updateProwlarrStatus() {
    const client = this._apiClients.prowlarr;
    if (!client) return;

    try {
      const indexers = await client.getIndexers();
      const totalIndexers = indexers.length;
      const downIndexers = indexers.filter(i => i.enable === false || i.status !== 'ok').length;

      await this.setCapabilityValue('measure_prowlarr_indexers', totalIndexers);
      await this.setCapabilityValue('measure_prowlarr_indexers_down', downIndexers);

      // Check for indexer issues and trigger flow
      const previousIndexers = (await this.getStoreValue('indexer_status')) || {};
      const currentIndexers = {};

      for (const indexer of indexers) {
        const name = indexer.name;
        const status = indexer.status || 'ok';
        currentIndexers[name] = status;

        if (status !== 'ok' && previousIndexers[name] === 'ok') {
          // New issue detected
          const trigger = this.homey.app.indexerIssueTrigger;
          await trigger.trigger(this, {
            indexer: name,
            app: 'prowlarr',
            message: status === 'disabled' ? 'Indexer is disabled' : `Indexer status: ${status}`
          }, {});
          this.log(`Indexer issue detected: ${name} (${status})`);
        }
      }

      await this.setStoreValue('indexer_status', currentIndexers);
      this.log(`Prowlarr status: ${totalIndexers} indexers, ${downIndexers} down`);
    } catch (error) {
      this.error('Error updating Prowlarr status:', error);
      this._setAppError('prowlarr', error.message || 'Prowlarr status error');
    }
  }

  /**
   * Run generic app command
   */
  async runAppCommand(appName, commandName) {
    const client = this._apiClients[appName];
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }

    try {
      await client.executeCommand(commandName);
      this.log(`Executed command ${commandName} on ${appName}`);
      return true;
    } catch (error) {
      this.error(`Error executing command ${commandName} on ${appName}:`, error);
      throw error;
    }
  }

  _serializeErrors() {
    return Object.entries(this._appErrors).map(([app, err]) => ({
      app,
      message: err.message,
      timestamp: err.timestamp,
    })).slice(0, 20);
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
   * Refresh data for a specific app (queue + calendar) without polling others
   */
  async refreshApp(appName) {
    const client = this._apiClients[appName];
    if (!client) {
      throw new Error(`No client configured for ${appName}`);
    }

    // Prowlarr only supports indexer status, not calendar/queue
    if (appName === 'prowlarr') {
      await this.updateProwlarrStatus();
      this._clearAppError(appName);
      await this.setStoreValue('app_errors', this._serializeErrors());
      this.log(`Refreshed app ${appName} (indexer status only)`);
      return { success: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const [calendar, queue] = await Promise.all([
        client.getCalendar(today, tomorrow),
        client.getQueue(),
      ]);

      // Update releases store
      const releases = (await this.getStoreValue('today_releases')) || [];
      const filteredReleases = releases.filter((r) => r.app !== appName);
      const newReleases = calendar.map((item) => {
        const title =
          item.title ||
          item.series?.title ||
          item.movie?.title ||
          item.album?.title ||
          item.artist?.artistName ||
          item.sourceTitle ||
          'Unknown';
        const hasFile = !!item.hasFile;
        return { app: appName, title, hasFile };
      });
      const mergedReleases = [...filteredReleases, ...newReleases].slice(0, 100);
      await this.setStoreValue('today_releases', mergedReleases);
      await this.setCapabilityValue('measure_today_releases', mergedReleases.length);

      // Update queue store
      const queueItems = (await this.getStoreValue('queue_items')) || [];
      const filteredQueue = queueItems.filter((q) => q.app !== appName);
      const newQueueItems = queue.map((item) => {
        const title =
          item.title ||
          item.series?.title ||
          item.movie?.title ||
          item.artist?.artistName ||
          item.sourceTitle ||
          'Unknown';
        return {
          id: item.id || item.queueId || item.downloadId || item.trackedDownloadId || '',
          app: appName,
          title,
          status: item.status || item.trackedDownloadStatus || 'queued',
          size: item.size || item.sizeleft || null,
          timeLeft: item.timeleft || item.estimatedCompletionTime || null,
        };
      });

      const perAppCounts = (await this.getStoreValue('queue_app_counts')) || { radarr: 0, sonarr: 0, lidarr: 0 };
      perAppCounts[appName] = newQueueItems.length;

      const mergedQueue = [...filteredQueue, ...newQueueItems];
      await this.setStoreValue('queue_items', mergedQueue.slice(0, 100));
      await this.setStoreValue('queue_app_counts', perAppCounts);
      await this.setCapabilityValue('measure_queue_count', mergedQueue.length);

      // Clear errors for this app
      this._clearAppError(appName);
      await this.setStoreValue('app_errors', this._serializeErrors());

      this.log(`Refreshed app ${appName}`);
      return { success: true };
    } catch (error) {
      this._setAppError(appName, error.message || 'Refresh error');
      await this.setStoreValue('app_errors', this._serializeErrors());
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
    
    // Force immediate update of all data (don't wait for polling intervals)
    try {
      await this.updateData();
      await this.checkHealth();
      await this.updateMissingCount();
      await this.updateLibrarySize();
      await this.updateCalendarData();
      await this.updateProwlarrStatus();
      this.log('Immediate data update completed after settings change');
    } catch (error) {
      this.error('Error during immediate update after settings change:', error);
    }

    return "Settings saved, and a manual refresh has been initiated. Please allow a few moments for all data to update."
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
