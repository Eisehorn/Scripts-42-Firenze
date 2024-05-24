import axios from "axios";
import {apiAnswer} from "./future";
import * as fs from "fs";

function CheckNextLink(nextlink : string) : string {
	let pattern : RegExp = /<([^>]+)>; rel="next"/
	const match : RegExpExecArray | null = pattern.exec(nextlink)
	if (match) {
		const secondLink = match[1]
		return secondLink
	}
	console.log('No match found')
	return('Big error encountered')
}

function printResult(allResponses: any[]) : string {
	if (fs.existsSync('./output.json'))
		fs.writeFile('output.json', "", err => {
			if (err) {
				console.error('Error wiping the file content: ', err)
			}
		})
	allResponses.forEach(responses => {
		fs.appendFile('output.json', JSON.stringify(responses, null, 2), err => {
			if (err) {
				console.error('Error writing into file: ', err)
				return ('Failure');
			}
		})
	})
	return ('Success');
}

export async function getFunction(token: any, url: string) {
	return new Promise<void>(async resolve => {
		let allResponses = []
		while (true) {
			try {
				console.log('Calls are being made...')
				let response = await axios.get(url, {
					headers: {
						Authorization: `Bearer ${token.access_token}`
					}
				})
				if (response.status >= 200 && response.status <= 299) {
					allResponses.push(response.data)
					try {
						const linkHeader = response.headers.link;
						const nextLink = linkHeader?.split(',').find((link: string) => link.includes('rel="next"'));
						if (nextLink != null) {
							url = CheckNextLink(nextLink); // Assuming CheckNextLink function exists
						} else {
							break;
						}
					} catch (error: any) {
						console.error(error.message);
					}
				} else {
					console.error('Failed to fetch data. Status code:', response.status);
					break;
				}
			} catch (e: any) {
				console.error(e.message)
				return
			}
		}
		printResult(allResponses)
		resolve()
	})
}