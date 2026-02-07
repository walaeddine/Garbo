using System.Reflection;
using System.Text;
using System.Linq.Dynamic.Core;

namespace Repository.Extensions;

public static class RepositoryExtensions
{
    public static IQueryable<T> Sort<T>(this IQueryable<T> entities, string orderByQueryString)
    {
        if (string.IsNullOrWhiteSpace(orderByQueryString))
            return entities;

        var orderParams = orderByQueryString.Trim().Split(',');
        var propertyInfos = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var orderQueryBuilder = new StringBuilder();

        foreach (var param in orderParams)
        {
            if (string.IsNullOrWhiteSpace(param))
                continue;

            var propertyFromQueryName = param.Split(" ")[0];
            var objectProperty = propertyInfos.FirstOrDefault(pi => pi.Name.Equals(propertyFromQueryName, StringComparison.InvariantCultureIgnoreCase));

            if (objectProperty == null)
                continue;

            var direction = param.EndsWith(" desc") ? "descending" : "ascending";
            orderQueryBuilder.Append($"{objectProperty.Name} {direction}, ");
        }

        var orderQuery = orderQueryBuilder.ToString().TrimEnd(',', ' ');

        if (string.IsNullOrWhiteSpace(orderQuery))
            return entities;

        return entities.OrderBy(orderQuery);
    }
    public static IQueryable<T> Search<T>(this IQueryable<T> entities, string searchTerm, params string[] propertyNames)
    {
        if (string.IsNullOrWhiteSpace(searchTerm) || propertyNames == null || propertyNames.Length == 0)
            return entities;

        var lowerTerm = searchTerm.Trim().ToLower();
        var searchBuilder = new StringBuilder();

        foreach (var prop in propertyNames)
        {
            if (searchBuilder.Length > 0)
                searchBuilder.Append(" || ");
            
            searchBuilder.Append($"{prop}.ToLower().Contains(@0)");
        }

        return entities.Where(searchBuilder.ToString(), lowerTerm);
    }
}
