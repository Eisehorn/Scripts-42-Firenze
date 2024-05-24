import {getToken} from "./tokenCreation";
import axios from "axios";
import * as fs from "fs";
// @ts-ignore
import csvParser from "csv-parser";
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

function printResult(mean: number) : string {
    if (fs.existsSync('./output.json'))
        fs.writeFile('output.json', "", err => {
            if (err) {
                console.error('Error wiping the file content: ', err)
            }
        })
        fs.appendFile('output.json', `La media dei wallet points totali è: ${mean}`, err => {
            if (err) {
                console.error('Error writing into file: ', err)
                return ('Failure');
            }
        })
    return ('Success');
}

export function apiAnswer(callType: string, success: boolean) {
    if (success) {
        console.log(`${callType.toUpperCase()} call ended successfully.`)
    }
    else {
        console.log(`There was a problem with your ${callType} call.`)
    }
}

async function walletCount(allResponses: any[]) {
    return new Promise<string>(async resolve => {
        let wpTotal = 0
        let people = 0
        const actives: string[] = await readActives()
        allResponses.forEach(responses => {
            responses.forEach((response: any) => {
                let active: boolean = false
                for (let i = 0; i < actives.length; i++) {
                    if (response.login === actives[i] && response.login != 'taccessi' && response.login != 'teaccess')
                        active = true
                }
                if (active === true) {
                    console.log(response.login, response.wallet, typeof response.wallet)
                    wpTotal += response.wallet
                    people += 1
                }
            })
        })
        let mean = wpTotal / people
        if (printResult(mean) === 'Success')
            resolve('Success')
        else {
            resolve('Failure')
        }
    })
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

async function getFunction(token: any) {
    let allResponses = []
    let url = 'https://api.intra.42.fr/v2/users?filter[primary_campus_id]=52'
    while (true) {
        try {
            console.log('Calls are being made...')
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                }
            });
            if (response.status >= 200 && response.status <= 299) {
                allResponses.push(response.data)
                try {
                    const linkHeader = response.headers.link;
                    const nextlink = linkHeader?.split(',').find((link: string) => link.includes('rel="next"'));
                    if (nextlink != null) {
                        url = CheckNextLink(nextlink);
                    } else {
                        break;
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                console.error('Failed to fetch data. Status code:', response.status);
                break;
            }
        } catch (error: any) {
            console.error('Failed to fetch data. Status code:', error.message)
            return;
        }
    }
    const actives: string[] = await readActives()
    //console.log(actives)
    if (await walletCount(allResponses) == 'Success') {
        apiAnswer('get', true);
    } else {
        apiAnswer('get', false)
    }
}

async function main() {
    let token = await getToken();
    await getFunction(token);
    //const actives: string[] = await readActives()
}

main();
