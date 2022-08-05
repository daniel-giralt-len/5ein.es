const fs = require("fs")
const buildDataPath = fileName => `${process.cwd()}/data/${fileName}.json`

const data = {
	"phb": require(buildDataPath("book/book-phb")),
	"races": require(buildDataPath("races")),
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
		console.err("got section", currentId, "but it has no 'entries'... was going to look for id",restOfIds[0])
	}

	return getSection(section.entries, restOfIds)
}
const srdOnly = dataInstance => dataInstance.srd

let dataOut = [
	data.legalinfo[0],
	getSection(data.phb.data, ["02b", "037", "038"]),
]

const outPath = buildDataPath("srd")
fs.writeFileSync(outPath, JSON.stringify(dataOut, null, 2))