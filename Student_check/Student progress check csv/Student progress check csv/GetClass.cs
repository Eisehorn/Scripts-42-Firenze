using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace APIcalltest;

using System.Collections.Generic;

public class Project
{
	public int id { get; set; }
	public string name { get; set; }
	public string slug { get; set; }
	public object parent_id { get; set; }
}

public class User
{
	
}

public class Team
{

}

public class ApiData
{
	public Project? project { get; set; }
	public int occurrence { get; set; }
	
	[JsonProperty("validated?")]
	public bool? Validated { get; set; }
	public string? status { get; set; }
	public string? marked_at { get; set; }
}


public class GetClass
{
	private static dynamic? Data { get; set; }

	private static int PrintResult(List<string> allResponses)
	{
		//int page = 1;
		foreach (var response in allResponses)
		{
			try
			{
				List<ApiData> apiDataList = JsonConvert.DeserializeObject<List<ApiData>>(response)!;
				int i = 0;
				foreach (var element in apiDataList)
				{
					if (element.project.slug.Contains("c-piscine") || element.project.slug.Contains("cellule") || element.Validated == false || element.status == "in_progress" ||  element.Validated == null)
					{
						continue;
					}
					Console.WriteLine(element.project.slug);
					Console.WriteLine(element.marked_at);
					i++;
				}
				
				// Data = ParseJson(response);
				// Console.WriteLine(Data);
				return i;
			}
			catch (Exception e)
			{
				return 0;
			}
		}

		return 0;
	}
	private static void PrintResultFilename(List<string> allResponses, string? url)
	{
		Dictionary<string, int> results = new Dictionary<string, int>();
		results.Add(ReturnLogin(url!), PrintResult(allResponses));
		using (StreamWriter writer = new StreamWriter("projects_passed.csv", true))
		{
			writer.WriteLine($"{results.First().Key};{results.First().Value}");
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
		else
		{
			Console.WriteLine("No match found.");
		}

		return "Big Error Encountered";
	}
	
	private static string? InsertUrl()
	{
		Console.WriteLine("Enter GET request endpoint:");
		string? endpoint = Console.ReadLine();
		return endpoint;
	}

	private static string InsertFilter()
	{
		string? answer = null;
		while (answer != "YES" && answer != "NO")
		{
			Console.WriteLine("Do you want to add any filter to your endpoint?");
			answer = Console.ReadLine()?.ToUpperInvariant();
			if (answer == "YES")
			{
				Console.WriteLine("Enter you filter now please");
				Console.WriteLine("Page filter already present, usage ex: &filter[id]=a_value,another_value");
				string filter = "?page=1";
				filter += Console.ReadLine();
				return filter;
			}
			else if (answer != "NO")
			{
				Console.WriteLine("Input error. Please insert Yes or No.");
			}
		}
		return "?page=1";
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
	public static dynamic ParseJson(string json)
	{
		dynamic parsedData = JsonConvert.DeserializeObject<dynamic>(json)!;
		return parsedData;
	}
	public static async Task GetFunction(TokenClass token, string url, bool check)
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
					catch (Exception e)
					{
						break;
					}
				}
				else
				{
					break;
				}
				Thread.Sleep(300);
			}
			PrintResultFilename(allResponses, url);
		}
	}
}