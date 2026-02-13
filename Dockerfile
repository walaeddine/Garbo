# Stage 1: Build React Frontend
FROM node:20-alpine AS client-build
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all backend source
COPY src/backend/ .

# Restore and Build
RUN dotnet restore "Api/Api.csproj"

# Workaround for .NET 10 Web SDK globbing regression (isolated to Api project)
RUN printf '<Project><PropertyGroup><EnableDefaultCompileItems>false</EnableDefaultCompileItems><EnableDefaultEmbeddedResourceItems>false</EnableDefaultEmbeddedResourceItems><EnableDefaultContentItems>false</EnableDefaultContentItems></PropertyGroup><ItemGroup>' > Api/Directory.Build.props \
 && cd Api \
 && find . -name "*.cs" | sed 's|^|<Compile Include="|;s|$|" />|' >> Directory.Build.props \
 && find . -name "*.resx" | sed 's|^|<EmbeddedResource Include="|;s|$|" />|' >> Directory.Build.props \
 && find . \( -name "*.cshtml" -o -name "*.razor" -o -name "*.css" -o -name "*.js" -o -name "*.json" \) | sed 's|^|<Content Include="|;s|$|" />|' >> Directory.Build.props \
 && printf '</ItemGroup></Project>' >> Directory.Build.props

RUN dotnet build "Api/Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Api/Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_ROLL_FORWARD=LatestMajor

# Create a non-root user for security
RUN useradd -u 5678 -m appuser && chown -R appuser /app
USER appuser

COPY --from=publish /app/publish .
# Copy React build to wwwroot
COPY --from=client-build /app/dist ./wwwroot

ENTRYPOINT ["dotnet", "Api.dll"]
