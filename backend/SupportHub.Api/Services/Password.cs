using System.Security.Cryptography;
using System.Text;

namespace SupportHub.Api.Data;

public static class Password
{
    // Demo-only hashing (not production)
    public static string Hash(string raw)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
        return Convert.ToHexString(bytes);
    }

    public static bool Verify(string raw, string hash) => Hash(raw) == hash;
}
