namespace ConstructionAssetManagement.Services;

public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a file stream to Azure Blob Storage and returns the public blob URL.
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

    /// <summary>
    /// Deletes a blob given its full URL.
    /// </summary>
    Task DeleteFileAsync(string blobUrl);

    /// <summary>
    /// Generates a short-lived, secure download URL (SAS) for a blob.
    /// </summary>
    Task<string> GetDownloadUrlAsync(string blobUrl);
}
