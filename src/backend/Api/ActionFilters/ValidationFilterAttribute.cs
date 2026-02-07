using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Api.ActionFilters;

public class ValidationFilterAttribute : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var action = context.RouteData.Values["action"];
        var controller = context.RouteData.Values["controller"];

        // Find parameters that are DTOs based on type name
        var dtoParam = context.ActionDescriptor.Parameters
            .FirstOrDefault(p => p.ParameterType.Name.EndsWith("Dto"));

        if (dtoParam != null)
        {
            // Check if the argument is null using the parameter name
            if (context.ActionArguments.TryGetValue(dtoParam.Name, out var value) && value is null)
            {
                 context.Result = new UnprocessableEntityObjectResult($"Object is null. Controller: {controller}, Action: {action}");
                 return;
            }
            // Case where the argument might not even be in ActionArguments (if null and not bound?)
            // Typically generic [FromBody] with null body ends up as null value in arguments.
            if (!context.ActionArguments.ContainsKey(dtoParam.Name))
            {
                 context.Result = new UnprocessableEntityObjectResult($"Object is null. Controller: {controller}, Action: {action}");
                 return;
            }
        }

        if (!context.ModelState.IsValid)
            context.Result = new UnprocessableEntityObjectResult(context.ModelState);
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
