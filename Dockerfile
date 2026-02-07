# Stage 1: Build React Frontend
FROM node:20 AS client-build
WORKDIR /app
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first for caching
COPY src/backend/Api/Api.csproj src/backend/Api/
COPY src/backend/Contracts/Contracts.csproj src/backend/Contracts/
COPY src/backend/Entities/Entities.csproj src/backend/Entities/
COPY src/backend/LoggerService/LoggerService.csproj src/backend/LoggerService/
COPY src/backend/Repository/Repository.csproj src/backend/Repository/
COPY src/backend/Service/Service.csproj src/backend/Service/
COPY src/backend/Service.Contracts/Service.Contracts.csproj src/backend/Service.Contracts/
COPY src/backend/Shared/Shared.csproj src/backend/Shared/

RUN dotnet restore "src/backend/Api/Api.csproj"

# Copy everything else and build
COPY src/backend/ src/backend/
WORKDIR /src/src/backend/Api
RUN dotnet build "Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Create a non-root user for security (optional but recommended)
# RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
# USER appuser

COPY --from=publish /app/publish .
# Copy React build to wwwroot
COPY --from=client-build /app/dist ./wwwroot

ENTRYPOINT ["dotnet", "Api.dll"]
