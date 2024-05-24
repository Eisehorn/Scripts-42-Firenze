using DotNetEnv;
using Newtonsoft.Json;

namespace APIcalltest;

public class TokenClass
{
	public string? access_token { get; set; }
	public static async Task<TokenClass?> GetToken()
	{
		using (HttpClient client = new HttpClient())
		{
			string url = "https://api.intra.42.fr/oauth/token";
			var requestBody = new FormUrlEncodedContent(new[]
			{
				new KeyValuePair<string, string>("grant_type", "client_credentials"),
				new KeyValuePair<string, string>("client_id", Environment.GetEnvironmentVariable("UID_42")!),
				new KeyValuePair<string, string>("client_secret", Environment.GetEnvironmentVariable("SECRET_42")!),
				new KeyValuePair<string, string>("scope", "public profile projects elearning tig forum"),
			});
			try
			{
				HttpResponseMessage response = await client.PostAsync(url, requestBody);
				string result = await response.Content.ReadAsStringAsync();
				if (response.IsSuccessStatusCode)
				{
					TokenClass? token = JsonConvert.DeserializeObject<TokenClass>(result);
					return token;
				}
				else
				{
					Console.WriteLine($"Error: {response.StatusCode}");
				}
				return null;
			}
			catch (Exception error)
			{
				Console.Error.WriteLine(error.Message);
				return null;
			}
		}
	}
}