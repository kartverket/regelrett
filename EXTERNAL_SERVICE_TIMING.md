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

### 2. Enhanced Request Context
- **Location**: `src/main/kotlin/no/bekk/util/RequestContext.kt`
- **Additions**:
  - `setRequestStartTime()` - Stores request start time for percentage calculations
  - `getRequestStartTime()` - Retrieves stored start time

### 3. Updated Request Logging Plugin
- **Location**: `src/main/kotlin/no/bekk/plugins/RequestLogging.kt`
- **Enhancement**: Automatically sets request start time when requests begin

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

## Debug Log Format

When debug logging is enabled for `no.bekk.util.ExternalServiceTimer`, each external service call will produce a log entry like:

```
External service call: AirTable.getRecords took 125ms (23.4% of request) [correlationId: abc123ef]
External service call: Microsoft.fetchGroups took 89ms (16.7% of request) [correlationId: abc123ef]
```

### Log Components:
- **Service Name**: `AirTable`, `Microsoft`
- **Operation**: Method name being called
- **Duration**: Milliseconds taken for the call
- **Percentage**: Percentage of total request processing time
- **Correlation ID**: For tracing related operations

## Configuration

### Enabling Debug Logs
Debug logging is configured in `src/main/resources/logback.xml`:

```xml
<logger name="no.bekk.util.ExternalServiceTimer" level="DEBUG"/>
```

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

## Usage Examples

The timing is now automatic for all external service calls. No changes needed in application code - the timing happens transparently within the service clients.

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