const phb = require("./data/spells/spells-phb.json")
const xge = require("./data/spells/spells-xge.json")
const tce = require("./data/spells/spells-tce.json")

countWordsInField = field => {
	if (!field) {
		return 0
	}
	return field.split(" ").length
}

const countWords = file => {
	return file.spell.reduce((acc, spell) => {
		const {
			name,
			components,
			entries,
			entriesHigherLevel,
		} = spell
		let words = 0;
		words += countWordsInField(name)
		words += countWordsInField(components && components.m && (typeof components.m === "object" ? components.m.text : components.m))
		words += countWordsInField(entries && entries[0])
		words += countWordsInField(entriesHigherLevel && entriesHigherLevel[0] && entriesHigherLevel[0].entries && entriesHigherLevel[0].entries[0])
		return acc + words
	}, 0)
}

total = countWords(tce) + countWords(xge) + countWords(phb)
console.log(total)