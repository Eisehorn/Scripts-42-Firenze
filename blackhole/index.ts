import {getToken} from "./tokenCreation";
import {blackHole, getCalls} from "./getCalls";
// @ts-ignore
import csvParser from "csv-parser";
import * as fs from "fs";
import {getAdapter} from "axios";

export function apiAnswer(callType: string, success: boolean) {
    if (success) {
        console.log(`${callType.toUpperCase()} call ended successfully.`)
    }
    else {
        console.log(`There was a problem with your ${callType} call.`)
    }
}

function readActives() {
    return new Promise<string[]>(resolve => {
        const results: any[] = []
        fs.createReadStream('./actives.csv')
            .pipe(csvParser())
            .on('data', (data: any) => results.push(data))
            .on('end', () =>{
                let actives: string[] = []
                results.forEach(result => {
                    actives.push(result.login)
                })
                resolve(actives)
            })
    })
}

async function main() {
    let token = await getToken();
    let logins: string[] = await readActives()
    for (let login of logins) {
        let url = `https://api.intra.42.fr/v2/users/${login}`
        await getCalls(token, url);
    }
    let toPrint: {[key:string]:string} = {}
    let i = 0
	let days: number[] = []
	let todayBlackhole: string[] = []
	const currentDate = new Date()
	todayBlackhole.push(currentDate.toString().split(' GMT')[0])
    for (let time of blackHole) {
        const targetDate = new Date(time.split(': ')[1])
        const differenceInTime = targetDate.getTime() - currentDate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
		days.push(Math.round(differenceInDays))
		while(time.split(': ')[0] != logins[i]) {
			i++
		}
        if (differenceInDays <= 7) {
			toPrint[logins[i]] = `Less than 7 days remaining.`
        }
        else {
			toPrint[logins[i]] = `More than 7 days remaining.`
		}
        i++
    }
	const data = fs.readFileSync('input.json', 'utf-8')
	let parsedData = JSON.parse(data)
	for (let i = 0; i < logins.length; i++) {
		if (days[i] >= 0) {
			if (parsedData[logins[i]] != toPrint[logins[i]]) {
				if (toPrint[logins[i]] == 'Less than 7 days remaining.') {
					todayBlackhole.push(logins[i] + ': ' + toPrint[logins[i]] + '(entered)' + ` ${days[i]} days remaining.`)
					console.log(logins[i] + ': ' + toPrint[logins[i]] + '(entered)' + ` ${days[i]} days remaining.`)
				}
				else {
					todayBlackhole.push(logins[i] + ': ' + toPrint[logins[i]] + '(exited)' + ` ${days[i]} days remaining.`)
					console.log(logins[i] + ': ' + toPrint[logins[i]] + '(exited)' + ` ${days[i]} days remaining.`)
				}
			}
			else if (toPrint[logins[i]] == 'Less than 7 days remaining.') {
				todayBlackhole.push(logins[i] + ': ' + toPrint[logins[i]] + ` ${days[i]} days remaining.`)
				console.log(logins[i] + ': ' + toPrint[logins[i]] + ` ${days[i]} days remaining.`)
			}
		}
	}

	if (fs.existsSync('./input.json')) {
		fs.writeFile('input.json', "", err => {
			if (err) {
				console.error('Error wiping the file content: ', err)
			}
		})
	}
    fs.appendFile('input.json', JSON.stringify(toPrint, null, 2), err => {})
	for (let j = 0; j < todayBlackhole.length; j++) {
		fs.appendFileSync('blackhole_history', todayBlackhole[j])
		if ( j == 0) {
			fs.appendFileSync('blackhole_history', '\n\n')
		}
		else {
			fs.appendFileSync('blackhole_history', '\n')
		}
	}
	fs.appendFileSync('blackhole_history', '\n-------------------------------------\n')
}

main();
