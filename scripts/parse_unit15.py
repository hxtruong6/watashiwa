import sys
import json
import uuid
import re


def clean_text(text):
    if not text:
        return ""
    # Remove tags inside text (like <br>, <ruby>, etc)
    # But first replace <br> with space
    text = re.sub(r"<br\s*/?>", " ", text, flags=re.IGNORECASE)
    # Remove other tags
    text = re.sub(r"<[^>]+>", "", text)
    return (
        text.replace("&nbsp;", " ").replace("\xa0", " ").replace("\u3000", " ").strip()
    )


def parse_html(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Isolate the table content if possible
    table_match = re.search(
        r'<table class="search_result">(.*?)</table>', content, re.DOTALL
    )
    if not table_match:
        return []

    table_content = table_match.group(1)

    vocab_list = []

    # Find all rows
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", table_content, re.DOTALL)

    for row_content in rows:
        # Find all cells
        # Need to capture attributes to check colspan
        # pattern: <td attrs>content</td>
        cells = re.findall(r"<(t[dh])\b([^>]*)>(.*?)</\1>", row_content, re.DOTALL)

        if not cells:
            continue

        # Check for header (th)
        if all(tag == "th" for tag, attrs, content in cells):
            continue

        tds = []
        colspans = []

        for tag, attrs, content in cells:
            tds.append(content)
            # Check colspan in attrs
            c_span = re.search(r'colspan=["\']?(\d+)["\']?', attrs)
            if c_span:
                colspans.append(int(c_span.group(1)))
            else:
                colspans.append(1)

        first_colspan = colspans[0]

        if first_colspan == 5:
            # Section header
            continue

        if first_colspan == 3:
            # Merged row logic
            # tds[0] is merged text, tds[1] is audio, tds[2] is meaning
            combined_text = clean_text(tds[0])
            word_surface = combined_text
            reading_kana = combined_text
            han_viet = ""
            meaning = clean_text(tds[2]) if len(tds) > 2 else ""

            vocab_list.append(
                {
                    "id": str(uuid.uuid4()),
                    "wordSurface": word_surface,
                    "readingKana": reading_kana,
                    "hanViet": han_viet,
                    "meaning": meaning,
                    "kanjiBreakdown": [],
                    "exampleSentence": None,
                }
            )
            continue

        if len(tds) < 5:
            continue

        # Normal row
        reading = clean_text(tds[0])
        surface = clean_text(tds[1])
        han_viet = clean_text(tds[2])
        # tds[3] is audio
        meaning = clean_text(tds[4])

        if not surface:
            surface = reading

        vocab_list.append(
            {
                "id": str(uuid.uuid4()),
                "wordSurface": surface,
                "readingKana": reading,
                "hanViet": han_viet,
                "meaning": meaning,
                "kanjiBreakdown": [],
                "exampleSentence": None,
            }
        )

    return vocab_list


if __name__ == "__main__":
    result = parse_html("unit15.html")
    print(json.dumps(result, indent=2, ensure_ascii=False))
