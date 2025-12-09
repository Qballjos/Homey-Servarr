# Servarr API Features Analysis

## Current Implementation

### API Endpoints Used
- ✅ `/api/v3/calendar` - Get releases for date range
- ✅ `/api/v3/queue` - Get download queue
- ✅ `/api/v3/history` - Get recent history (for download finished detection)
- ✅ `/api/v3/command` (POST) - Pause/Resume queue
- ✅ `/api/v3/queue/{id}` (DELETE) - Remove queue item
- ✅ `/api/v3/system/status` - Test connection

### Flow Cards Implemented
**Triggers:**
- ✅ A download has finished
- ✅ The queue is empty

**Actions:**
- ✅ Pause all Servarr Downloads
- ✅ Resume all Servarr Downloads
- ✅ Pause [APP] Downloads

---

## Additional Servarr API Endpoints Available

### Monitoring & Status
- `/api/v3/wanted/missing` - Get missing/wanted items (movies/series/albums not yet downloaded)
- `/api/v3/health` - Get system health status (warnings, errors)
- `/api/v3/system/status` (extended) - More detailed system info (version, branch, etc.)
- `/api/v3/queue/status` - Queue status details (paused, etc.)

### Search & Management
- `/api/v3/command` (POST with "MissingMoviesSearch", "MissingEpisodeSearch", "ArtistSearch") - Trigger searches
- `/api/v3/movie` (GET) - List all movies (Radarr)
- `/api/v3/series` (GET) - List all series (Sonarr)
- `/api/v3/artist` (GET) - List all artists (Lidarr)
- `/api/v3/movie/{id}` (PUT) - Update movie (toggle monitored, etc.)
- `/api/v3/series/{id}` (PUT) - Update series
- `/api/v3/artist/{id}` (PUT) - Update artist

### History & Events
- `/api/v3/history` (extended) - More detailed history with filters
- `/api/v3/event` - System events (notifications)

---

## Recommended Additional Features (Lightweight)

### High Priority (Useful & Lightweight)

#### 1. **Health Check Trigger** ⭐⭐⭐
- **Flow Trigger**: "Health check failed" / "Health warning"
- **API**: `/api/v3/health`
- **Use Case**: Alert when Servarr has issues (disk space, indexer down, etc.)
- **Weight**: Light (single endpoint, poll every 10-15 minutes)
- **Implementation**: Add health check to polling cycle, trigger on new warnings/errors

#### 2. **Missing Items Count** ⭐⭐⭐
- **Capability**: `measure_missing_count` (number)
- **API**: `/api/v3/wanted/missing`
- **Use Case**: Monitor how many movies/series/albums are wanted but not downloaded
- **Weight**: Light (single endpoint, can be polled less frequently, e.g., every 15 minutes)
- **Widget**: Add to Release Agenda widget or separate widget

#### 3. **Search for Missing Items Action** ⭐⭐
- **Flow Action**: "Search for missing [APP] items"
- **API**: `/api/v3/command` with "MissingMoviesSearch" / "MissingEpisodeSearch" / "ArtistSearch"
- **Use Case**: Manually trigger searches for wanted items
- **Weight**: Very light (on-demand only, no polling)

#### 4. **Queue Status Capability** ⭐⭐
- **Capability**: `onoff.queue_paused` (boolean)
- **API**: `/api/v3/queue/status` or track pause/resume state
- **Use Case**: Show if queue is paused in widget/Flow conditions
- **Weight**: Very light (already tracked via pause/resume actions)

### Medium Priority (Useful but More Complex)

#### 5. **Media Added Trigger** ⭐⭐
- **Flow Trigger**: "A movie/series/album was added"
- **API**: Monitor `/api/v3/movie`, `/api/v3/series`, `/api/v3/artist` for new items
- **Use Case**: Notify when new media is added to library
- **Weight**: Medium (requires tracking previous state, more API calls)

#### 6. **Resume [APP] Downloads Action** ⭐⭐
- **Flow Action**: "Resume [APP] Downloads" (per-app resume, complement to pause_app)
- **API**: `/api/v3/command` with "Resume" per app
- **Use Case**: Resume specific app after pausing
- **Weight**: Very light (mirror of pause_app)

#### 7. **Monitored Status Toggle** ⭐
- **Flow Action**: "Toggle monitored status for [title]"
- **API**: `/api/v3/movie/{id}`, `/api/v3/series/{id}`, `/api/v3/artist/{id}` (PUT)
- **Use Case**: Enable/disable monitoring for specific items
- **Weight**: Medium (requires search by title, more complex)

### Low Priority (Nice to Have)

#### 8. **Library Size Widget** ⭐
- **Capability**: `measure_library_size` (number of movies/series/albums)
- **API**: `/api/v3/movie`, `/api/v3/series`, `/api/v3/artist` (count only)
- **Use Case**: Display total library size
- **Weight**: Medium (requires counting all items, can be cached)

#### 9. **Import List Status** ⭐
- **API**: `/api/v3/importlist`
- **Use Case**: Monitor import lists (Trakt, etc.)
- **Weight**: Medium (additional endpoint, less common use case)

#### 10. **Quality Profile Info** ⭐
- **API**: `/api/v3/qualityprofile`
- **Use Case**: Display quality profiles in settings
- **Weight**: Low (mostly informational, not critical)

---

## Flow Cards Recommendations

### Most Useful Additions

1. **"Health check failed" Trigger** - High value, lightweight
2. **"Resume [APP] Downloads" Action** - Completes pause/resume symmetry
3. **"Search for missing items" Action** - Useful automation
4. **"Missing items count" Capability** - Good monitoring metric

### Less Critical (but still useful)

5. **"Media added" Trigger** - Nice notification feature
6. **"Queue is paused" Condition** - Useful for Flow logic
7. **"Toggle monitored" Action** - Advanced control

---

## Implementation Priority

### Phase 1 (Quick Wins - Lightweight)
1. ✅ Resume [APP] Downloads Action (mirror of pause_app)
2. ✅ Health Check Trigger (poll every 15 min, single endpoint)
3. ✅ Missing Items Count (poll every 15 min, single endpoint)

### Phase 2 (Medium Complexity)
4. Search for Missing Items Action (on-demand, simple)
5. Queue Status Capability (track state, lightweight)

### Phase 3 (More Complex)
6. Media Added Trigger (requires state tracking)
7. Toggle Monitored Action (requires search by title)

---

## Notes

- **Keep it lightweight**: All additions should maintain the 5-minute polling philosophy
- **On-demand first**: Prefer actions over triggers where possible (actions = no polling)
- **Cache wisely**: Use device store for state tracking to avoid extra API calls
- **User choice**: Consider making some features optional (settings toggle) to keep base app minimal

