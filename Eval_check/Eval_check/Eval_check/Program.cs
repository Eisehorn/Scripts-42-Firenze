using System.Dynamic;
using System.Net;
using System.Numerics;
using System.Text;
using System.Text.RegularExpressions;
using APIcalltest;
using DotNetEnv;
using Newtonsoft.Json;
using Sprache;

class Program
{
	
	static async Task Main()
	{
		TokenClass? token = await TokenClass.GetToken();
		List<string> students = new List<string>();
		string url = "https://api.intra.42.fr";
		bool check = true;
		List<string> ydayValue = new List<string>();
		using (StreamReader sr = new StreamReader("notte.csv"))
		{
			string? line;
			while ((line = sr.ReadLine()) != null)
			{
				if (line.Split(';')[0] == "Intra_login")
				{
					continue;
				}
				students.Add(line.Split(';')[0]);
				ydayValue.Add(line.Split(';')[1]);
			}
		}
		using (StreamWriter writer = new StreamWriter("notte.csv"))
		{
			writer.WriteLine("Intra_login;Yesterday_slots;Today_slots");
		}
		
		//await GetClass.GetFunction(token!, url + "/v2/users/lamici/slots/graph/on/begin_at/by/hour_of_day?per_page=500", check);
		foreach (var student in students)
		{
			string url_to_send = url + $"/v2/users/{student}/slots/graph/on/begin_at/by/hour_of_day";
			await GetClass.GetFunction(token!, url_to_send, check, ydayValue.First());
			ydayValue.Remove(ydayValue.First());
		}
		Console.WriteLine("Program executed successfully!");
	}
}