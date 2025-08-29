# External Service Timing Implementation

## Overview
This implementation adds comprehensive timing and logging for external service calls to Airtable and Microsoft Graph APIs.

## Features Added

### 1. ExternalServiceTimer Utility
- **Location**: `src/main/kotlin/no/bekk/util/ExternalServiceTimer.kt`
- **Purpose**: Measures execution time of external service calls and calculates their percentage of total request time
- **Methods**:
  - `time()` - Core timing function with correlation ID and percentage calculation
  - `ApplicationCall.timeExternalCall()` - Ktor-specific wrapper for easy use in routes

### 2. Request Context System
- **RequestContextPlugin**: `src/main/kotlin/no/bekk/plugins/RequestContext.kt` (always installed)
  - Sets up correlation ID and request start time for all requests
  - Provides correlation tracking independent of logging configuration
- **RequestContext**: `src/main/kotlin/no/bekk/util/RequestContext.kt`
  - `setRequestStartTime()` - Stores request start time for percentage calculations
  - `getRequestStartTime()` - Retrieves stored start time
  - `getOrCreateCorrelationId()` - Generates/retrieves correlation ID

### 3. Updated Request Logging Plugin
- **Location**: `src/main/kotlin/no/bekk/plugins/RequestLogging.kt`
- **Enhancement**: Now focuses only on request/response logging (context setup moved to RequestContextPlugin)

### 4. Timed External Service Calls

#### AirTableClient (src/main/kotlin/no/bekk/providers/clients/AirTableClient.kt)
All methods now wrapped with timing:
- `getBases()` - "AirTable.getBases"
- `getBaseSchema()` - "AirTable.getBaseSchema"  
- `getRecords()` - "AirTable.getRecords"
- `getRecord()` - "AirTable.getRecord"
- `refreshWebhook()` - "AirTable.refreshWebhook"

#### MicrosoftService (src/main/kotlin/no/bekk/services/MicrosoftService.kt)
All methods now wrapped with timing:
- `requestTokenOnBehalfOf()` - "Microsoft.requestTokenOnBehalfOf"
- `fetchGroups()` - "Microsoft.fetchGroups"
- `fetchCurrentUser()` - "Microsoft.fetchCurrentUser"
- `fetchUserByUserId()` - "Microsoft.fetchUserByUserId"

## Configuration

### Enabling External Service Timing
External service timing is controlled by the `external_service_timing` configuration option in `conf/defaults.yaml`:

```yaml
server:
  # Log web requests
  router_logging: false

  # Enable timing and debug logging for external service calls (Airtable, Microsoft Graph)
  external_service_timing: false
```

This setting is independent of `router_logging` - you can enable external service timing without enabling general request logging.

### Enabling Debug Logs
Debug logging is configured in `src/main/resources/logback.xml`:

```xml
<logger name="no.bekk.util.ExternalServiceTimer" level="DEBUG"/>
```

## Debug Log Format

When external service timing is enabled and debug logging is configured, each external service call will produce a log entry like:

```
External service call: AirTable.getRecords took 125ms (23.4% of request) [correlationId: abc123ef]
External service call: Microsoft.fetchGroups took 89ms (16.7% of request) [correlationId: abc123ef]
```

### Log Components:
- **Service Name**: `AirTable`, `Microsoft`
- **Operation**: Method name being called
- **Duration**: Milliseconds taken for the call
- **Percentage**: Percentage of total request processing time
- **Correlation ID**: For tracing related operations (always present now)

## Architecture Changes

### Fixed Correlation ID Issue
- **Problem**: Correlation IDs were showing as "unknown" when `router_logging` was disabled
- **Solution**: Split functionality into separate plugins:
  - `RequestContextPlugin` - Always installed, handles correlation ID and timing setup
  - `RequestLoggingPlugin` - Only installed when `router_logging` is enabled

### Configurable Timing
- **Problem**: External service timing was always enabled
- **Solution**: Added `external_service_timing` configuration option that controls whether timing occurs

## Testing

### Test Files Created:
1. `src/test/kotlin/no/bekk/util/ExternalServiceTimerTest.kt` - Unit tests
2. `src/test/kotlin/no/bekk/integrationTests/ExternalServiceTimingIntegrationTest.kt` - Integration tests
3. `src/test/kotlin/no/bekk/util/ExternalServiceTimerDemoTest.kt` - Demo/example test

### Test Coverage:
- Basic timing functionality
- Percentage calculation accuracy
- Null safety handling
- Multiple consecutive calls
- Realistic scenarios with mixed processing and external calls
- Configuration toggle behavior

## Usage Examples

The timing is now automatic for all external service calls when enabled. No changes needed in application code - the timing happens transparently within the service clients.

For custom external service calls, use:

```kotlin
val result = ExternalServiceTimer.time("MyService", "myOperation", correlationId, requestStartTime) {
    // Your external service call here
    someExternalApi.call()
}
```

## Benefits

1. **Performance Monitoring**: Track slow external services
2. **Request Analysis**: See what percentage of request time is spent on external calls
3. **Debugging**: Correlate external service performance with overall request performance
4. **Alerting**: Can be used to set up alerts for slow external service calls
5. **Optimization**: Identify which external services contribute most to request latency
6. **Configurable**: Can be enabled/disabled independently of general request logging