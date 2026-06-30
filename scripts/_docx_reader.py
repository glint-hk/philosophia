import zipfile, xml.etree.ElementTree as ET, json, sys
path = sys.argv[1]
with zipfile.ZipFile(path) as z:
    xml = z.read('word/document.xml')
root = ET.fromstring(xml)
texts = []
for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    runs = [r.text for r in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if r.text]
    if runs:
        texts.append(''.join(runs))
print(json.dumps(texts))