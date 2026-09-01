import os
import json
import sqlite3
import zipfile
import time
import tempfile

def create_anki_deck(deck_name, cards, output_apkg_path):
    """
    Creates a genuine .apkg file compatible with all Anki versions (PC, Mac, iOS, Android)
    using only Python's standard library (sqlite3 and zipfile).
    """
    timestamp = int(time.time() * 1000)
    deck_id = timestamp
    model_id = timestamp + 1
    
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "collection.anki2")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # 1. Create Anki schema
        cur.executescript("""
        CREATE TABLE col (
            id              integer primary key,
            crt             integer not null,
            mod             integer not null,
            scm             integer not null,
            ver             integer not null,
            dty             integer not null,
            usn             integer not null,
            ls              integer not null,
            conf            text not null,
            models          text not null,
            decks           text not null,
            dconf           text not null,
            tags            text not null
        );
        CREATE TABLE notes (
            id              integer primary key,
            guid            text not null,
            mid             integer not null,
            mod             integer not null,
            usn             integer not null,
            tags            text not null,
            flds            text not null,
            sfld            integer not null,
            csum            integer not null,
            flags           integer not null,
            data            text not null
        );
        CREATE TABLE cards (
            id              integer primary key,
            nid             integer not null,
            did             integer not null,
            ord             integer not null,
            mod             integer not null,
            usn             integer not null,
            type            integer not null,
            queue           integer not null,
            due             integer not null,
            ivl             integer not null,
            factor          integer not null,
            reps            integer not null,
            lapses          integer not null,
            left            integer not null,
            odue            integer not null,
            odid            integer not null,
            flags           integer not null,
            data            text not null
        );
        CREATE TABLE revlog (
            id              integer primary key,
            cid             integer not null,
            usn             integer not null,
            ease            integer not null,
            ivl             integer not null,
            lastIvl         integer not null,
            factor          integer not null,
            time            integer not null,
            type            integer not null
        );
        CREATE TABLE graves (
            usn             integer not null,
            oid             integer not null,
            type            integer not null
        );
        CREATE INDEX ix_notes_usn on notes (usn);
        CREATE INDEX ix_cards_usn on cards (usn);
        CREATE INDEX ix_revlog_usn on revlog (usn);
        CREATE INDEX ix_cards_nid on cards (nid);
        CREATE INDEX ix_cards_sched on cards (did, queue, due);
        """)
        
        # Models configuration (Basic Model)
        models = {
            str(model_id): {
                "id": model_id,
                "name": "Medicinety Basic",
                "type": 0,
                "mod": int(time.time()),
                "usn": -1,
                "sortf": 0,
                "did": deck_id,
                "tmpls": [
                    {
                        "name": "Card 1",
                        "ord": 0,
                        "qfmt": "<div style='font-family: Arial; font-size: 20px; color: #111; text-align: center; padding: 20px;'>{{Front}}</div>",
                        "afmt": "{{FrontSide}}\n\n<hr id=answer>\n\n<div style='font-family: Arial; font-size: 18px; color: #0D9488; text-align: center; padding: 20px; font-weight: bold;'>{{Back}}</div>",
                        "bqfmt": "",
                        "bafmt": "",
                        "did": None,
                        "bfont": "",
                        "bsize": 0
                    }
                ],
                "flds": [
                    {"name": "Front", "ord": 0, "sticky": False, "rtl": False, "font": "Arial", "size": 20, "media": []},
                    {"name": "Back", "ord": 1, "sticky": False, "rtl": False, "font": "Arial", "size": 20, "media": []}
                ],
                "css": ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }",
                "latexPre": "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
                "latexPost": "\\end{document}",
                "latexsvg": False,
                "req": [[0, "all", [0]]]
            }
        }
        
        decks = {
            "1": {"id": 1, "name": "Default", "mod": int(time.time()), "usn": 0, "collapsed": False, "desc": "", "dyn": 0, "conf": 1, "extendNew": 0, "extendRev": 0},
            str(deck_id): {"id": deck_id, "name": deck_name, "mod": int(time.time()), "usn": -1, "collapsed": False, "desc": "Medicinety Official Medical Flashcards Deck", "dyn": 0, "conf": 1, "extendNew": 0, "extendRev": 0}
        }
        
        conf = {"nextPos": 1, "estTimes": True, "activeDecks": [deck_id], "sortType": "noteFld", "timeLim": 0, "sortBackwards": False, "addToCur": True, "curDeck": deck_id, "curModel": str(model_id), "collapseTime": 1200}
        dconf = {"1": {"id": 1, "name": "Default", "mod": 0, "usn": 0, "maxTaken": 60, "autoplay": True, "timer": 0, "replayq": True, "new": {"bury": False, "delays": [1, 10], "initialFactor": 2500, "ints": [1, 4, 7], "order": 1, "perDay": 20}, "lapse": {"delays": [10], "leechAction": 0, "leechFails": 8, "minInt": 1, "mult": 0}, "rev": {"bury": False, "ease4": 1.3, "fuzz": 0.05, "ivlFct": 1, "maxIvl": 36500, "minSpace": 1, "perDay": 200}}}
        
        cur.execute("INSERT INTO col VALUES(1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, ?)", (
            int(time.time()),
            int(time.time() * 1000),
            int(time.time() * 1000),
            json.dumps(conf),
            json.dumps(models),
            json.dumps(decks),
            json.dumps(dconf),
            "{}"
        ))
        
        # Insert notes and cards
        for idx, card in enumerate(cards):
            nid = timestamp + 10 + idx * 2
            cid = timestamp + 11 + idx * 2
            guid = f"medicinety_{idx}_{int(time.time())}"
            q = card.get("question", "").strip()
            a = card.get("answer", "").strip()
            flds = f"{q}\x1f{a}"
            sfld = q
            csum = 0
            
            cur.execute("INSERT INTO notes VALUES(?, ?, ?, ?, -1, '', ?, ?, ?, 0, '')", (
                nid, guid, model_id, int(time.time()), flds, sfld, csum
            ))
            
            cur.execute("INSERT INTO cards VALUES(?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, '')", (
                cid, nid, deck_id, int(time.time()), idx
            ))
            
        conn.commit()
        conn.close()
        
        # Zip into .apkg
        media_path = os.path.join(tmpdir, "media")
        with open(media_path, "w", encoding="utf-8") as f:
            f.write("{}")
            
        with zipfile.ZipFile(output_apkg_path, "w", zipfile.ZIP_DEFLATED) as z:
            z.write(db_path, "collection.anki2")
            z.write(media_path, "media")
            
    print(f"Successfully generated genuine .apkg deck with {len(cards)} cards at {output_apkg_path}")

if __name__ == "__main__":
    test_cards = [
        {"question": "What is the primary function of CD4+ T cells?", "answer": "Coordinate immune responses by releasing cytokines."},
        {"question": "Which immunoglobulin is predominantly found in mucosal secretions?", "answer": "IgA dimer."}
    ]
    test_out = r"C:\Users\ONE BY ONE\.gemini\antigravity\scratch\medicinety-platform\public\anki\test_deck.apkg"
    create_anki_deck("Immunology Test Deck", test_cards, test_out)
