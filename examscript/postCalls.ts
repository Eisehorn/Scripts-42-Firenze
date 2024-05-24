import axios from "axios";
import {apiAnswer} from "./index";
import * as readline from 'readline';

async function examCreation(token: any, day: string, begin_at: string, end_at: string, exam_name: string, reserve: boolean) {
	let response: any;
	if (reserve) {
		response = await axios.post(
			'https://api.intra.42.fr/v2/exams',
			{
				exam: {
					begin_at: `2024-${day}${begin_at}`,
					campus_id: 52,
					end_at: `2024-${day}${end_at}`,
					ip_range: '10.12.0.0/21',
					location: "Nidavellir",
					max_people: 18,
					name: `${exam_name}`,
					project_ids: [
						1304
					],
					visible: "true",
					activate_waitlist: "false"
				}
			},
			{
				headers: {
					Authorization: `Bearer ${token.access_token}`,
					'Content-Type': 'application/json',
				},
			}
		);
	}
	else {
		response = await axios.post(
			'https://api.intra.42.fr/v2/exams',
			{
				exam: {
					begin_at: `2024-${day}${begin_at}`,
					campus_id: 52,
					end_at: `2024-${day}${end_at}`,
					ip_range: '10.12.0.0/21',
					location: "Nidavellir",
					max_people: 18,
					name: `${exam_name}`,
					project_ids: [
						1320,
						1321,
						1322,
						1323,
						1324
					],
					visible: "true",
					activate_waitlist: "false"
				}
			},
			{
				headers: {
					Authorization: `Bearer ${token.access_token}`,
					'Content-Type': 'application/json',
				},
			}
		);
	}
	if (response.status == 201) {
		apiAnswer(`${exam_name} at hour ${begin_at}`, true);
	}
	else {
		apiAnswer(`${exam_name} at hour ${begin_at}`, false);
	}
}

export async function postFunction(token : any) {
	if (!token || !token.access_token) {
		console.error('Access token is missing or invalid.');
		return;
	}

	try {
		const rl = readline.createInterface({
			input: process.stdin,
		});
		console.log('Insert the day of the exam.');
		console.log('Example: 07-17');
		rl.question('', async (input: string)=> {
			//await examCreation(token, input.trim(), 'T08:00:00.000Z', 'T12:00:00.000Z','Esame di Riserva | Sessione Mattutina', true);
			await examCreation(token, input.trim(), 'T08:00:00.000Z', 'T11:00:00.000Z','Exam Rank 0* | Sessione Ordinaria', false);
			//await examCreation(token, input.trim(), 'T13:00:00.000Z', 'T17:00:00.000Z','Esame di Riserva | Sessione Ordinaria', true);
			await examCreation(token, input.trim(), 'T12:30:00.000Z', 'T15:30:00.000Z','Exam Rank 0* | Sessione Ordinaria', false);
			//await examCreation(token, input.trim(), 'T16:00:00.000Z', 'T20:00:00.000Z','Esame di Riserva | Sessione Serale', true);
			await examCreation(token, input.trim(), 'T16:00:00.000Z', 'T19:00:00.000Z','Exam Rank 0* | Sessione Serale', false);
			rl.close();
		})
	} catch (error : any) {
		console.error('Request error:', error.message);
		console.log(error);
	}
}