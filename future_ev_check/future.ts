import {getToken} from "./tokenCreation";
import {getFunction} from "./getCall";
import {readJson} from "./jsonFilter";
export function apiAnswer(callType: string, success: boolean) {
	if (success) {
		console.log(`${callType.toUpperCase()} call ended successfully.`)
	}
	else {
		console.log(`There was a problem with your ${callType} call.`)
	}
}

async function main() {
	let token = await getToken()
	//await getFunction(token, 'https://api.intra.42.fr/v2/scale_teams?filter[campus_id]=52&filter[future]=true')
	//await readJson()
	//console.log('Script ended.')
}

main()
