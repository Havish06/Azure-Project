using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;

namespace ConstructionAssetManagement.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(IConfiguration configuration, ILogger<BlobStorageService> logger)
    {
        _logger = logger;

        // Connection string is read from environment variable / .env / Azure App Service config.
        // Expected config key: AzureBlobStorage:ConnectionString
        var connectionString = configuration["AzureBlobStorage:ConnectionString"]
            ?? throw new InvalidOperationException(
                "Azure Blob Storage connection string not configured. Set AZURE_BLOB_STORAGE_CONNECTION_STRING in .env");

        var containerName = configuration["AzureBlobStorage:ContainerName"] ?? "asset-documents";

        var serviceClient = new BlobServiceClient(connectionString);
        _containerClient = serviceClient.GetBlobContainerClient(containerName);

        // Ensure container exists (safe no-op if it already does)
        _containerClient.CreateIfNotExists(PublicAccessType.None);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}-{fileName}";
        var blobClient = _containerClient.GetBlobClient(uniqueFileName);

        var headers = new BlobHttpHeaders { ContentType = contentType };
        await blobClient.UploadAsync(fileStream, new BlobUploadOptions { HttpHeaders = headers });

        _logger.LogInformation("Uploaded blob {BlobName}", uniqueFileName);
        return blobClient.Uri.ToString();
    }

    public async Task DeleteFileAsync(string blobUrl)
    {
        var blobName = new Uri(blobUrl).Segments[^1];
        var blobClient = _containerClient.GetBlobClient(blobName);
        await blobClient.DeleteIfExistsAsync();
    }

    public Task<string> GetDownloadUrlAsync(string blobUrl)
    {
        var blobName = new Uri(blobUrl).Segments[^1];
        var blobClient = _containerClient.GetBlobClient(blobName);

        if (!blobClient.CanGenerateSasUri)
        {
            // If using Managed Identity / RBAC instead of a connection string with an account key,
            // SAS generation isn't available this way — fall back to the direct (private) URL and
            // rely on the App Service / client having appropriate access, or implement user-delegation SAS.
            return Task.FromResult(blobUrl);
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = blobClient.BlobContainerName,
            BlobName = blobClient.Name,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        return Task.FromResult(sasUri.ToString());
    }
}
