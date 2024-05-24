import * as fs from 'fs'

export async function readJson() {
	fs.writeFileSync('future_corrections.txt', '\n\nAttenzione: orario indietro di 120 minuti causa settaggi internazionali!\n\n', 'utf-8')
	fs.readFile('output.json', 'utf-8', (err, jsonData) =>{
		if (err) {
			console.error('Error reading file:', err)
		}
		else {
			const data = JSON.parse(jsonData)
			const filteredData = data.filter((element: any) => {
				return element.corrector &&
					typeof element.corrector === "object" &&
						element.corrector.login !== "supervisor"
			})
			let dataToWrite: {[key: string]: string}[] = []
			filteredData.forEach((element: any) => {
				//console.log(element)
				if (!element.team.project_gitlab_path.includes('discovery-piscine')) {
					let logins = ""
					for (let i = 0; i < element.correcteds.length; i++) {
						logins += element.correcteds[i].login
						if (i + 1 != element.correcteds.length) {
							logins += ", "
						}
					}
					dataToWrite.push({login: logins, corrector: element.corrector.login, data: element.begin_at})
				}
			})
			fs.appendFileSync('future_corrections.txt', JSON.stringify(dataToWrite, null, 2), 'utf-8');
		}
	})
	fs.unlink('output.json', err => {
		if (err) {
			console.error(err)
		}
		return
	})
}