using System.Dynamic;
using System.Net;
using System.Numerics;
using System.Text;
using System.Text.RegularExpressions;
using APIcalltest;
using DotNetEnv;
using Newtonsoft.Json;
using Sprache;

public class PostData()
{
	public List<int> IntList { get; set; } = new List<int>();
	public List<string> StringList { get; set; } = new List<string>();
}

class Program
{
	public static void CheckUrlAndRespond(bool success, string call)
	{
		if (success)
		{
			Console.WriteLine($"{call} call ended successfully");
		}
		else
		{
			Console.WriteLine($"There was a problem with your {call} call");
		}
	}
	private static void ExitFunction()
	{
		Environment.Exit(0);
	}
	private static string? AnotherCall()
	{
		Console.WriteLine('\n' + "Do you want to perform another call?");
		string? anotherCall = Console.ReadLine()?.ToUpperInvariant();
		if (anotherCall == "NO")
			ExitFunction();
		else if (anotherCall != "YES")
		{
			Console.WriteLine("Invalid input. Please enter Yes or No");
		}
		return anotherCall;
	}
	static async Task Main()
	{
		TokenClass? token = await TokenClass.GetToken();
		List<string> students = new List<string>();
		string url = "https://api.intra.42.fr";
		bool check = true;
		using (StreamReader sr = new StreamReader("all_logins.txt"))
		{
			string? line;
			while ((line = sr.ReadLine()) != null)
			{
				students.Add(line);
			}
		}
		using (StreamWriter writer = new StreamWriter("projects_passed.csv"))
		{
			writer.WriteLine("Intra_login;Projects_passed");
		}

		await GetClass.GetFunction(token, url + "/v2/users/ciusca/projects_users?per_page=500", check);
		// foreach (var student in students)
		// {
		// 	string url_to_send = url + $"/v2/users/{student}/projects_users?per_page=500";
		// 	await GetClass.GetFunction(token, url_to_send, check);
		// }
	}
}