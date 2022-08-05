const fs = require("fs")
const buildDataPath = fileName => `${process.cwd()}/data/${fileName}.json`

const data = {
	"phb": require(buildDataPath("book/book-phb")).data,
	"races": require(buildDataPath("races")).race,
	"legalinfo": require(buildDataPath("legalinfo")),
	"bestiary": require(buildDataPath("bestiary/bestiary-mm")),
	"spells": require(buildDataPath("spells/spells-phb")),
}

const getSection = (source, idsTrail) => {
	const [currentId, ...restOfIds] = idsTrail
	const section = source.find(({id}) => currentId === id)
	if (!section) {
		console.err("COULD NOT FIND SECTION", idsTrail[0])
		return {}
	}
	if (restOfIds.length === 0) {
		return section
	}
	if (!section.entries) {
		console.err("got section", currentId, "but it has no 'entries'... was going to look for id", restOfIds[0])
	}

	return getSection(section.entries, restOfIds)
}
const srdOnly = dataInstance => dataInstance.srd
const sortByNameDesc = (a, b) => a.name.localeCompare(b.name)

let dataOut = [
	data.legalinfo[0], // legal info
	getSection(data.phb, ["02b", "037", "038"]), // races explanation
	data.races
		.filter(srdOnly)
		.map(({subraces, ...rest}) => ({...rest, subraces: subraces ? subraces.filter(srdOnly) : null}))
		.sort(sortByNameDesc), // races

]

const outPath = buildDataPath("srd")
fs.writeFileSync(outPath, JSON.stringify(dataOut, null, 2))