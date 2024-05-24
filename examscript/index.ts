import {getToken} from "./tokenCreation";
import {postFunction} from "./postCalls";

export function apiAnswer(callType: string, success: boolean) {
    if (success) {
        console.log(`${callType.toUpperCase()} call ended successfully.`)
    }
    else {
        console.log(`There was a problem with your ${callType} call.`)
    }
}

async function main() {
    let token = await getToken();
    await postFunction(token);
}

main();
