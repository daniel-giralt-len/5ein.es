from deep_translator import GoogleTranslator
import json

FILE_PATH = "./data/class/class-mystic.json"

def translate_object(o):
	for k,v in o.items():
		tv = type(v)
		print(f'{k}, {tv}')
		if tv is str:
			nv = GoogleTranslator(source='english', target='catalan').translate(v)
			print(f'translated to {nv}')
			o[k] = nv
		elif tv is list:
			nl = []
			print('is list')
			for av in v:
				nav = av
				if type(av) is str:
					nav = GoogleTranslator(source='english', target='catalan').translate(av)
					print(f'translating {v} to {nav}')
				elif type(av) is dict:
					nav = translate_object(av)
				nl.append(nav)
			print(nl)
			o[k] = nl
		elif tv is dict:
			translate_object(v)
	return o

with open(FILE_PATH, 'r', encoding="utf-8") as f:
	j = translate_object(json.load(f))
	with open(FILE_PATH, 'w', encoding="utf-8") as w:
		w.write(json.dumps(j, ensure_ascii=False, indent='\t'))
