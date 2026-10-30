"""Rebuild the standalone reader from the exact tested web assets."""
from pathlib import Path
import os, zipfile, re, json
site=Path(os.environ.get('BAHR_DIR','texts/ibn-ajiba/al-bahr-al-madid'))
url='https://gnamma-research.github.io/booksite/texts/ibn-ajiba/al-bahr-al-madid/'
files=sorted(p for p in site.rglob('*') if p.is_file() and p.suffix not in ['.pdf','.zip'] and p.name!='offline-files.json')
(site/'offline-files.json').write_text(json.dumps(['./']+[str(p.relative_to(site)) for p in files],indent=2)+'\n')
with zipfile.ZipFile(site/'offline-reader.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    def put(name,data):
        info=zipfile.ZipInfo('Immense-Ocean/'+name,date_time=(2026,10,30,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        z.writestr(info,data,compresslevel=9)
    for p in files:
        name=str(p.relative_to(site)); data=p.read_bytes()
        if p.suffix in ['.html','.js','.css'] and not name.startswith('data/'):
            s=data.decode()
            s=s.replace('../../../daruri/','https://gnamma-research.github.io/booksite/daruri/').replace('href="../../../"','href="https://gnamma-research.github.io/booksite/"')
            s=re.sub(r'href="(editions/[^"\n]+\.pdf)"',lambda m:'href="'+url+m.group(1)+'"',s)
            if p.name=='app.js':
                s=s.replace("href=\"editions/'+f+'\"", "href=\""+url+"editions/'+f+'\"")
            data=s.encode()
        put(name,data)
    put('START_HERE.txt','THE IMMENSE OCEAN — VOLUME I\n\nOpen index.html in a modern browser. No installation or server is required.\nAll Arabic and English text, reference tools, dictionary and indices are included.\nPDF editions remain separate online downloads.\nReading Desk notes are browser-local; export a backup before moving devices.\nNo new Arabic vowelling layer is included.\n\nHosted edition: '+url+'\n')
with zipfile.ZipFile(site/'offline-reader.zip') as z:
    assert z.testzip() is None
    assert url+'editions/' in z.read('Immense-Ocean/app.js').decode()
print('Verified standalone package:',len(files)+1,'files')
