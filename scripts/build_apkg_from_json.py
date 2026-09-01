import sys
import json
import hashlib
import genanki

def build(json_input_path, output_apkg_path):
    with open(json_input_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    deck_name = data.get("deckName", "Medicinety Deck").strip()
    cards = data.get("cards", [])
    
    # Stable Deck ID based on deck name hash
    deck_id = int(hashlib.md5(deck_name.encode("utf-8")).hexdigest()[:8], 16)
    
    # Standard official Anki Basic Model (Pure text, 100% editable, no boxes/images)
    basic_model = genanki.Model(
        1607392319,
        'Basic (Medicinety)',
        fields=[
            {'name': 'Front'},
            {'name': 'Back'},
        ],
        templates=[
            {
                'name': 'Card 1',
                'qfmt': '<div dir="auto">{{Front}}</div>',
                'afmt': '{{FrontSide}}\n\n<hr id="answer">\n\n<div dir="auto">{{Back}}</div>',
            },
        ],
        css='''
        .card {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 22px;
            text-align: center;
            color: #111827;
            background-color: #ffffff;
            line-height: 1.6;
            padding: 20px;
        }
        '''
    )
    
    my_deck = genanki.Deck(
        deck_id,
        deck_name
    )
    
    for c in cards:
        q = c.get("question", "").strip().replace("\n", "<br>")
        a = c.get("answer", "").strip().replace("\n", "<br>")
        if q or a:
            note = genanki.Note(
                model=basic_model,
                fields=[q, a],
                guid=genanki.guid_for(q)
            )
            my_deck.add_note(note)
            
    package = genanki.Package(my_deck)
    package.write_to_file(output_apkg_path)
    print(f"Successfully generated pure text Anki APKG with {len(cards)} cards at {output_apkg_path}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        build(sys.argv[1], sys.argv[2])
