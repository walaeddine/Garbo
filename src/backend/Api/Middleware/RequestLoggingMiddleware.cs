using System.Diagnostics;
using Contracts;

namespace Api.Middleware;

public class RequestLoggingMiddleware(RequestDelegate next, ILoggerManager logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var timer = Stopwatch.StartNew();
        
        try
        {
            await next(context);
        }
        finally
        {
            timer.Stop();
            var statusCode = context.Response.StatusCode;
            var elapsedMs = timer.ElapsedMilliseconds;
            
            if (elapsedMs > 500)
            {
                logger.LogWarn($"Slow Request: {context.Request.Method} {context.Request.Path} responded {statusCode} in {elapsedMs}ms");
            }
            else
            {
                // We could log Info here too if we want every request, 
                // but usually we avoid spamming logs with every successful 200.
                // For now, let's log major info for observability requested by user.
                logger.LogInfo($"{context.Request.Method} {context.Request.Path} responded {statusCode} in {elapsedMs}ms");
            }
        }
    }
}
