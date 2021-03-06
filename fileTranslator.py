from deep_translator import GoogleTranslator
import json
import sys

google_translator = GoogleTranslator(source='english', target='catalan')
TRANSLATOR_MAX_STRING_LENGTH = 5000

def translate_string(string):
	string_parts = [google_translator.translate(string[0+i:TRANSLATOR_MAX_STRING_LENGTH+i]) for i in range(0, len(string), TRANSLATOR_MAX_STRING_LENGTH)]
	return ''.join(string_parts)

def translate_object(object):
	for key, value in object.items():
		value_type = type(value)
		if value_type is str:
			print(f'translated {key}')

			translated_string = translate_string(value)
			object[key] = translated_string
		elif value_type is list:
			print(f'{key} is list')

			translated_list = []
			for list_entry in value:
				translated_list_entry = list_entry
				list_entry_type = type(list_entry)

				if list_entry_type is str:
					translated_list_entry = translate_string(list_entry)
					print(f'translating {translated_list_entry}')
				elif list_entry_type is dict:
					translated_list_entry = translate_object(list_entry)

				translated_list.append(translated_list_entry)
			
			print(translated_list)
			object[key] = translated_list
		elif value_type is dict:
			translate_object(value)
	return object

with open(sys.argv[1], 'r', encoding="utf-8") as input_file_data:
	translated_json = translate_object(json.load(input_file_data))
	with open(sys.argv[1], 'w', encoding="utf-8") as w:
		w.write(json.dumps(translated_json, ensure_ascii=False, indent='\t'))
