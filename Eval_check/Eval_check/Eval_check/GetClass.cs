using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace APIcalltest;

using System.Collections.Generic;

public class ApiData
{
	[JsonProperty("1")]
	public string? Hour1 { get; set; }
	[JsonProperty("2")]
	public string? Hour2 { get; set; }
	[JsonProperty("3")]
	public string? Hour3 { get; set; }
	[JsonProperty("4")]
	public string? Hour4 { get; set; }
	[JsonProperty("5")]
	public string? Hour5 { get; set; }
}


public class GetClass
{

	private static int PrintResult(List<string> allResponses)
	{
		foreach (var response in allResponses)
		{
			try
			{
				ApiData apiDataList = JsonConvert.DeserializeObject<ApiData>(response)!;
				int result = int.Parse(apiDataList.Hour1!) + int.Parse(apiDataList.Hour2!) 
								+ int.Parse(apiDataList.Hour3!) + int.Parse(apiDataList.Hour4!) 
									+ int.Parse(apiDataList.Hour5!);
				return result;
			}
			catch (Exception)
			{
				return 0;
			}
		}

		return 0;
	}
	private static void PrintResultFilename(List<string> allResponses, string? url, string ydayValue)
	{
		Dictionary<string, int> results = new Dictionary<string, int>();
		results.Add(ReturnLogin(url!), PrintResult(allResponses));
		using (StreamWriter writer = new StreamWriter("notte.csv", true))
		{
			writer.WriteLine($"{results.First().Key};{ydayValue};{results.First().Value}");
		}
	}

	private static string ReturnLogin(string url)
	{
		string[] urlSplitted = url.Split('/');
		return urlSplitted[5];
	}

	private static string CheckNextLink(string nextlink)
	{
		string input = nextlink;
		string pattern = @"<([^>]+)>; rel=""next""";
		Match match = Regex.Match(input, pattern);
		if (match.Success)
		{
			string secondLink = match.Groups[1].Value;
			return secondLink;
		}
		Console.WriteLine("No match found.");
		return "Big Error Encountered";
	}
	
	private static string? InsertUrl()
	{
		Console.WriteLine("Enter GET request endpoint:");
		string? endpoint = Console.ReadLine();
		return endpoint;
	}

	private static async Task<string> CheckIfCorrectUrl(HttpClient client)
	{
		string url = $"https://api.intra.42.fr";
		url += InsertUrl();
		HttpResponseMessage response = await client.GetAsync(url);
		if (response.IsSuccessStatusCode == true)
		{
			return url;
		}
		Console.WriteLine($"{url} returned an error, please retry");
		return "Big Error Encountered";
	}

	public static async Task GetFunction(TokenClass token, string url, bool check, string ydayValue)
	{
		using (HttpClient client = new HttpClient())
		{
			List<string> allResponses = new List<string>();
			client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token.access_token}");
			if (check != true)
			{
				while (true)
				{
					url = await CheckIfCorrectUrl(client);
					if (url != "Big Error Encountered")
					{
						break;
					}
				}
			}
			while (true)
			{
				HttpResponseMessage response = await client.GetAsync(url);
				HttpContent responseContent = response.Content;
				Console.WriteLine("Calls are being made, please wait...");
				if (response.IsSuccessStatusCode)
				{
					allResponses.Add(await responseContent.ReadAsStringAsync());
					try
					{
						var nextlink = response.Headers.GetValues
							("Link")?.FirstOrDefault(link => link.Contains("rel=\"next\""));
						if (nextlink != null)
						{
							url = CheckNextLink(nextlink);
						}
						else
						{
							break;
						}
					}
					catch (Exception)
					{
						break;
					}
				}
				else
				{
					break;
				}
				Thread.Sleep(150);
			}
			PrintResultFilename(allResponses, url, ydayValue);
		}
	}
}