const fs = require("fs")
const buildDataPath = fileName => `${process.cwd()}/data/${fileName}.json`

const data = {
	"phb": require(buildDataPath("book/book-phb")).data,
	"dmg": require(buildDataPath("book/book-dmg")).data,
	"mm": require(buildDataPath("book/book-mm")).data,
	"races": require(buildDataPath("races")).race,
	"items": require(buildDataPath("items")).item,
	"legalinfo": require(buildDataPath("legalinfo")),
	"miscellaneousCreaturesNames": require(buildDataPath("miscellaneouscreatures")),
	"feats": require(buildDataPath("feats")).feat,
	"trapshazards": require(buildDataPath("trapshazards")).trap,
	"conditionsdiseases": require(buildDataPath("conditionsdiseases")),
	"bestiary": require(buildDataPath("bestiary/bestiary-mm")).monster,
	"backgrounds": require(buildDataPath("backgrounds")).background,
	"spells": require(buildDataPath("spells/spells-phb")).spell,
	"classes": [
		require(buildDataPath("class/class-barbarian")),
		require(buildDataPath("class/class-bard")),
		require(buildDataPath("class/class-cleric")),
		require(buildDataPath("class/class-druid")),
		require(buildDataPath("class/class-fighter")),
		require(buildDataPath("class/class-monk")),
		require(buildDataPath("class/class-paladin")),
		require(buildDataPath("class/class-ranger")),
		require(buildDataPath("class/class-rogue")),
		require(buildDataPath("class/class-sorcerer")),
		require(buildDataPath("class/class-warlock")),
		require(buildDataPath("class/class-wizard")),
	],
}

const cleanEntriesRecursively = (entriesIn, idsToRemove) => {
	return entriesIn
		.filter(e => !idsToRemove.includes(e.id))
		.map(e => {
			if (typeof e !== "object" || !e.entries) { return e }
			return ({
				...e,
				entries: cleanEntriesRecursively(e.entries, idsToRemove),
			})
		})
}

const getSection = (source, idsTrail, idsToRemove = []) => {
	const [currentId, ...restOfIds] = idsTrail
	const section = source.find(({id}) => currentId === id)
	if (!section) {
		console.error("COULD NOT FIND SECTION", idsTrail[0])
		return {}
	}

	const cleanedEntries = cleanEntriesRecursively(section.entries, idsToRemove)

	if (restOfIds.length === 0) {
		return {
			...section,
			entries: cleanedEntries,
		}
	}
	if (!cleanedEntries) {
		console.error("got section", currentId, "but it has no 'entries'... was going to look for id", restOfIds[0])
	}

	return getSection(cleanedEntries, restOfIds, idsToRemove)
}
const srdOnly = dataInstance => dataInstance.srd
const sortByNameDesc = (a, b) => a.name.localeCompare(b.name)
const getSrdMarkedSection = (name, data) => ({
	name,
	type: "entries",
	entries: data.filter(srdOnly).sort(sortByNameDesc),
})

let dataOut = [
	{
		name: "Legal Info",
		type: "section",
		entries: data.legalinfo[0],
	},
	getSection(data.phb, ["02b", "037", "038"]), // races explanation
	{
		name: "Races",
		type: "entries",
		entries: data.races
			.filter(srdOnly)
			.map(({subraces, ...rest}) => ({...rest, subraces: subraces ? subraces.filter(srdOnly) : null}))
			.sort(sortByNameDesc),
	},
	{ // TODO: Remove fluff in english
		name: "Classes",
		type: "entries",
		entries: data.classes
			.map(({class: classes, subclass, classFeature, subclassFeature, ...rest}) => ({
				...rest,
				class: classes ? classes.find(srdOnly) : null,
				subclass: subclass ? subclass.filter(srdOnly) : null,
				classFeature: classFeature ? classFeature.filter(srdOnly) : null,
				subclassFeature: subclassFeature ? subclassFeature.filter(srdOnly) : null,
			}))
			.sort((a, b) => sortByNameDesc(a.class, b.class)),

	},
	getSection(data.phb, ["00e", "029"], ["02a"]), // passat el nivell 1
	getSection(data.phb, ["0f2", "0f3"], ["101"]), // multiclasse
	getSection(data.phb, ["041", "042", "049"], ["04b"]), // alineament
	getSection(data.phb, ["041", "042", "04c"]), // idiomes
	getSection(data.phb, ["041", "053"]), // inspiració
	getSection(data.phb, ["041", "056"], ["05c"]), // referons
	getSrdMarkedSection("Rerefons d'Exemple", data.backgrounds),
	getSection(data.phb, ["05d"], ["05e", "0f1", "06f"]), // equipament
	getSection(data.phb, ["0f2", "102"], ["102s"]), // dots explicació
	getSrdMarkedSection("Dots d'Exemple", data.feats),
	getSection(data.phb, ["103"], ["13a"]), // emprar puntuacions de característica
	getSection(data.phb, ["144", "145"]), // time
	getSection(data.phb, ["144", "146"], ["151", "169"]), // movement, environment (15e), resting (16f), between adventures (172)
	getSection(data.phb, ["17a"], ["18f", "1bc"]), // time
	getSection(data.phb, ["1cc"], ["1f5"]), // spellcasting
	{ // spell lists
		...getSection(data.phb, ["1e7"], ["216"]),
		entries: getSection(data.phb, ["1e7"], ["216"]).entries.sort(sortByNameDesc),
	},
	getSrdMarkedSection("Descripcions dels Conjurs", data.spells),
	getSection(data.dmg, ["19f", "211"], ["217"]), // traps
	getSrdMarkedSection("Trampes d'Exemple", data.trapshazards),
	getSection(data.dmg, ["289", "2f6"], ["2f7"]), // diseases
	getSrdMarkedSection("Malalties d'Exemple", data.conditionsdiseases.disease),
	getSection(data.dmg, ["289", "300"]), // madness
	getSection(data.dmg, ["289", "2cb"]), // objects
	getSection(data.dmg, ["289", "2f8"], ["2fe", "2ff", "2fd"]), // poisons
	{
		name: "Metzines d'Exemple",
		type: "entries",
		entries: data.items
			.filter(srdOnly)
			.filter(i => i.verí)
			.sort(sortByNameDesc),
	},
	getSection(data.dmg, ["23c", "248"], ["249", "24a", "24b", "24e", "24f", "263", "266", "267", "268"]), // magic items
	{
		name: "Objectes Màgics",
		type: "entries",
		entries: data.items
			.filter(srdOnly)
			.filter(i => !i.verí)
			.filter(i => !["none", "artifact"].includes(i.rarity))
			.sort(sortByNameDesc),
	},
	getSection(data.dmg, ["23c", "26a"], ["270", "273"]), // sentient items
	{
		name: "Llista d'Artefactes",
		type: "entries",
		entries: data.items
			.filter(srdOnly)
			.filter(i => i.rarity === "artifact")
			.sort(sortByNameDesc),
	},
	getSection(data.mm, ["000", "002", "00a", "00b"]), // modifying monsters
	getSection(data.mm, ["000", "00c"], ["023"]), // monsters mechanics
	{
		name: "Llista de Monstres",
		type: "entries",
		entries: data.bestiary
			.filter(srdOnly)
			.filter(i => !data.miscellaneousCreaturesNames.includes(i.name))
			.sort(sortByNameDesc),
	},
	getSection(data.phb, ["1f6"], ["1f6s"]), // conditions explanation
	getSrdMarkedSection("Condicions", data.conditionsdiseases.condition), // conditions list
]

const outPath = buildDataPath("srd")
fs.writeFileSync(outPath, JSON.stringify(dataOut, null, 2))