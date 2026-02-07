using Microsoft.Extensions.Primitives;

namespace Api.Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string CorrelationIdHeader = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(CorrelationIdHeader, out StringValues correlationId))
        {
            correlationId = Guid.NewGuid().ToString();
        }

        context.Response.Headers.Append(CorrelationIdHeader, correlationId);
        
        // Use NLog ScopeContext (NLog 5+) for structured logging with correlation IDs
        using (NLog.ScopeContext.PushProperty("CorrelationId", correlationId.ToString()))
        {
            await next(context);
        }
    }
}
