import axios from "axios";
import {apiAnswer} from "./index";
import * as fs from 'fs'

export let blackHole: string[] = []

function printResult(allResponses: any[]) : string {
	allResponses.forEach(responses => {
		responses.cursus_users.forEach((curs: any) => {
			if (curs.blackholed_at != null) {
				blackHole.push(`${responses.login}: ${curs.blackholed_at.split('T')[0]}`)
			}
		})
	})
	return ('Success');
}

export async function getCalls(token: any, url: string) {
	return new Promise<void>(async (resolve) => {
		let allResponses = []
		while (true) {
			try {
				//console.log('Calls are being made...')
				const response = await axios.get(url, {
					headers: {
						Authorization: `Bearer ${token.access_token}`,
					}
				});
				if (response.status >= 200 && response.status <= 299) {
					allResponses.push(response.data)
					break;
				} else {
					console.error('Failed to fetch data. Status code:', response.status);
					break;
				}
			} catch (error: any) {
				console.error('Failed to fetch data. Status code:', error.message)
				return;
			}
		}
		printResult(allResponses)
		resolve()
	})
}