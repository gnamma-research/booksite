/* Gnamma personal PDF editions: statically hosted, browser-only.
   Published edition bytes are never written back to GitHub.
   Native PDF comments are section-level: do NOT invent quote coordinates. */
(() => {
  'use strict';
  const STORAGE='gnamma-reading-desk-v1';
  const URL_ROOT=new URL('.',location.href);
  const MAX_ITEMS=500;
  const $=id=>document.getElementById(id);
  const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap=(s,n=800)=>String(s==null?'':s).slice(0,n);
  const nameOf=t=>{
    if(!t)return 'Unattached';
    if(t.section)return '§'+t.section+(Number.isInteger(t.segment)?' · paragraph '+(t.segment+1):'');
    if(t.term)return 'Dictionary / index: '+cap(t.term,80);
    if(t.app)return 'Bidāya application: '+cap(t.app,40);
    if(t.lesson)return 'Study lesson: '+cap(t.lesson,60);
    return 'Saved reference';
  };
  const isNote=r=>r&&r.kind==='note';
  const isBookmark=r=>Boolean(r&&r.kind!=='note'&&(
    r.target&&typeof r.target==='object'||String(r.title||'').trim()||
    String(r.body||'').trim()||r.archivedValue!==undefined
  ));
  function available(records,prefs){
    return records.filter(r=>r&&!r.deleted&&(
      (prefs.personal&&isNote(r))||(prefs.bookmarks&&isBookmark(r))
    ));
  }
  function normalizeDesk(data){
    if(data?.format!=='gnamma-reading-desk'||data.version!==1||!Array.isArray(data.items))
      throw Error('Unknown Reading Desk backup format');
    const ids=new Set();
    return data.items.map((entry,i)=>{
      const r=entry&&typeof entry==='object'&&!Array.isArray(entry)?
        entry:{kind:'unavailable',title:'Unrecognized saved entry',archivedValue:entry};
      const sourceId=String(r.id??'saved-'+(i+1));
      let id=sourceId||'saved-'+(i+1),n=0;
      while(ids.has(id))id=sourceId+' · record '+(i+1)+(n++?' ('+n+')':'');
      ids.add(id);
      const kind=typeof r.kind==='string'?r.kind:'unavailable';
      const title=typeof r.title==='string'?r.title:r.title==null?'':JSON.stringify(r.title);
      const body=typeof r.body==='string'?r.body:r.body==null?'':JSON.stringify(r.body);
      const target=r.target&&typeof r.target==='object'&&!Array.isArray(r.target)?r.target:null;
      return {...r,id,originalId:sourceId,kind,title,body,target,
        deleted:Number(r.deleted)||0,created:Number(r.created)||0,
        modified:Number(r.modified)||0,updated:Number(r.updated)||0,
        dateSource:typeof r.dateSource==='string'?r.dateSource:'unverified'};
    });
  }
  let loadError='';
  function loadDesk(){
    try{
      const raw=localStorage.getItem(STORAGE);
      if(!raw)return [];
      loadError='';
      return normalizeDesk(JSON.parse(raw));
    }catch(error){
      loadError='Your Reading Desk could not be read in this browser: '+error.message+'. Your original data has not been changed.';
      showError(loadError);
      return [];
    }
  }
  function orderItems(rows,order){
    const num=v=>{const n=Number(v);return Number.isFinite(n)?n:1e9;};
    return rows.slice().sort((a,b)=>{
      if(order==='newest'||order==='created'){
        const at=a.created||a.updated||0,bt=b.created||b.updated||0;
        const diff=order==='newest'?bt-at:at-bt;
        if(diff)return diff;
      }
      const x=a.target||{},y=b.target||{};
      const sx=num(x.section)-num(y.section);if(sx)return sx;
      const px=num(x.segment??-1)-num(y.segment??-1);if(px)return px;
      return num(x.offset||0)-num(y.offset||0)||String(a.id).localeCompare(String(b.id));
    });
  }
  function dateLine(r){
    if(r.dateSource!=='recorded'||!r.created)return 'Original date not recorded reliably';
    const fmt=n=>new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(n));
    try{return 'Saved '+fmt(r.created)+(r.modified?' · Edited '+fmt(r.modified):'');}
    catch(_){return 'Date unavailable';}
  }
  function entryText(r,i,dates){
    const h='['+(i+1)+'] '+nameOf(r.target);
    const title=cap(r.title|| (isNote(r)?'Personal note':'Saved passage'),240);
    const text=isNote(r)?r.body:(r.target?.quote||r.body||(r.archivedValue!==undefined?JSON.stringify(r.archivedValue):'Saved passage / bookmark'));
    const quote=r.target?.quote&&isNote(r)?'\nSelected text: '+cap(r.target.quote,1000):'';
    return h+'\n'+title+'\n'+cap(text,30000)+quote+(dates?'\n'+dateLine(r):'');
  }
  function verifiedPage(section,metadata,pdfPages){
    if(!/^\d{1,3}$/.test(String(section||'')))return -1;
    const n=Number(metadata?.section_pages?.[String(section)]);
    return Number.isInteger(n)&&n>0&&n<=pdfPages?n-1:-1;
  }
  function requiresAppendix(rows,p){
    return Boolean(p.annotations&&!p.appendix&&rows.some((r,i)=>
      String(r.body||'').length>30000||
      (r.kind==='note'&&String(r.target?.quote||'').length>1000)||
      (r.kind!=='note'&&String(r.target?.quote||'').length>30000)||
      entryText(r,i,p.dates).length>24000));
  }
  const model={available,orderItems,dateLine,entryText,verifiedPage,isNote,isBookmark,normalizeDesk,requiresAppendix};
  window.GnammaPersonalExportModel=model;
  let manifest=null,records=[],selectedIds=new Set(),busy=false,resultURL=null,resultFile=null;
  let lastFilename='';
  function showError(text){
    const out=$('pe-alert');if(!out)return;
    out.hidden=false;out.classList.add('error');out.textContent=text;
  }
  function info(text){
    const out=$('pe-alert');out.hidden=!text;out.classList.remove('error');out.textContent=text||'';
  }
  function mode(){return document.querySelector('input[name="pe-mode"]:checked')?.value||'none';}
  function prefs(){return {
    personal:$('pe-personal').checked,bookmarks:$('pe-bookmarks').checked,
    annotations:$('pe-annotations').checked,appendix:$('pe-appendix').checked,
    dates:$('pe-dates').checked,order:$('pe-order').value
  };}
  function matching(){
    const p=prefs();let rows=available(records,p);
    if(mode()==='choose')rows=rows.filter(r=>selectedIds.has(r.id));
    return orderItems(rows,p.order);
  }
  function fileUrl(file){
    // Only filenames from the trusted manifest may ever be passed here.
    return new URL(file,URL_ROOT).href;
  }
  function syncForm(event){
    if(event?.type==='change'){$('pe-result').hidden=true;info('');}
    const has=mode()!=='none';
    $('pe-note-options').hidden=!has;
    $('pe-picker').hidden=mode()!=='choose';
    const pdf=manifest?.files?.[$('pe-edition').value];
    if(pdf){$('pe-clean').href=fileUrl($('pe-edition').value);}
    else $('pe-clean').removeAttribute('href');
    const p=prefs(),rows=has?matching():[];
    $('pe-generate').textContent=has?'Download personal PDF':'Open unchanged PDF';
    $('pe-description').textContent=!has?
      'Original published PDF only. No Reading Desk items or personal data are added.':
      (rows.length+' Reading Desk item'+(rows.length===1?'':'s')+' selected. A new PDF will be created locally; the original edition stays unchanged.');
    $('pe-count').textContent=has?rows.length+' qualifying item'+(rows.length===1?'':'s')+
      (rows.some(r=>r.target?.section)?' · in-text entries will be pinned to source section pages where mapping is verified':' · appendix-only references'):'';
    const overflow=has&&requiresAppendix(rows,p);
    $('pe-generate').disabled=busy||!pdf|| (has&&(!rows.length||(!p.appendix&&!p.annotations)||rows.length>MAX_ITEMS||overflow));
    if(overflow)$('pe-count').textContent+=' · The selected material is too long for pop-up notes alone; enable the full notes appendix.';
    if(has&&rows.length>MAX_ITEMS)$('pe-count').textContent+=' · Too many for one export. Choose up to '+MAX_ITEMS+' items.';
    if(mode()==='choose')renderPicker();
    if(!has){$('pe-result').hidden=true;if(!loadError)info('');}
    if(loadError)showError(loadError);
  }
  function renderPicker(){
    const p=prefs(),eligible=available(records,p),q=String($('pe-search').value||'').toLowerCase().trim();
    const visible=eligible.filter(r=>!q||[r.title,r.body,r.target?.quote,nameOf(r.target)].join(' ').toLowerCase().includes(q));
    const root=$('pe-items');root.replaceChildren();
    const displayLimit=240;
    for(const r of visible.slice(0,displayLimit)){
      const label=document.createElement('label');label.className='item';
      const check=document.createElement('input');check.type='checkbox';check.checked=selectedIds.has(r.id);
      check.dataset.noteId=r.id;
      const text=document.createElement('span');
      text.className='item-title';text.textContent=(r.title||nameOf(r.target)).slice(0,120);
      const meta=document.createElement('small');meta.textContent=nameOf(r.target)+(isNote(r)?' · Personal note':' · Bookmark');
      text.append(meta);label.append(check,text);root.append(label);
    }
    const eligibleSelected=eligible.filter(r=>selectedIds.has(r.id)).length;
    $('pe-picker-count').textContent=eligibleSelected+' selected · '+visible.length+' matching / '+eligible.length+' qualifying items'+
      (visible.length>240?' · Showing first 240; narrow the search to display other items':'');
  }
  function progress(label,percent){
    $('pe-progress').hidden=false;$('pe-progress-text').textContent=label;
    $('pe-bar').value=Math.max(0,Math.min(100,percent));
  }
  function blankCanvas(size){
    const factor=2;
    const canvas=document.createElement('canvas');canvas.width=Math.round(size.width*factor);
    canvas.height=Math.round(size.height*factor);
    const c=canvas.getContext('2d',{alpha:false});if(!c)throw Error('Canvas drawing is unavailable');
    c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);
    return {canvas,c,W:canvas.width,H:canvas.height,padding:76,y:115,links:[],searchLines:[]};
  }
  function fontFor(s,kind){
    const arabic=(String(s).match(/[\u0600-\u06ff]/g)||[]).length;
    const latin=(String(s).match(/[A-Za-z]/g)||[]).length;
    if(arabic>0&&arabic>latin*0.6)return {font:(kind==='title'?'bold ':'')+'29px Naskh, SourceSerif, serif',rtl:true,lh:49};
    return {font:(kind==='title'?'bold 30px SourceSerif, Georgia, serif':kind==='meta'?'21px sans-serif':'26px SourceSerif, Naskh, Georgia, serif'),rtl:false,lh:kind==='title'?40:kind==='meta'?32:39};
  }
  function breakLong(c,word,max){
    const out=[];let piece='';
    for(const ch of Array.from(word)){
      if(piece&&c.measureText(piece+ch).width>max){out.push(piece);piece='';}
      piece+=ch;
    }
    if(piece)out.push(piece);
    return out;
  }
  function linesFor(c,str,width){
    const words=String(str).split(/\s+/).filter(Boolean);
    const lines=[];let cur='';
    for(const word of words){
      const chunks=c.measureText(word).width>width?breakLong(c,word,width):[word];
      for(const chunk of chunks){
        const test=cur?cur+' '+chunk:chunk;
        if(cur&&c.measureText(test).width>width){lines.push(cur);cur=chunk;}
        else cur=test;
      }
    }
    if(cur)lines.push(cur);
    return lines.length?lines:[''];
  }
  function printFooter(sheet,pageNumber){
    const c=sheet.c;c.save();c.fillStyle='#777';c.font='20px sans-serif';c.textAlign='left';c.direction='ltr';
    c.fillText('PERSONAL READING DESK · not part of the published text',sheet.padding,sheet.H-55);
    c.textAlign='right';c.fillText(String(pageNumber),sheet.W-sheet.padding,sheet.H-55);c.restore();
  }
  // New personal references are standard PDF GoTo links, not comment boxes.
  function makeLink(pdf,page,targetPage,rect,targetTop){
    return window.GnammaPdfUpgrade.attachLink(pdf,page,targetPage,rect,targetTop);
  }
  async function toJpeg(canvas){
    return new Promise((resolve,reject)=>{
      canvas.toBlob(blob=>blob?blob.arrayBuffer().then(resolve,reject):reject(Error('Cannot encode appendix page')),
        'image/jpeg',0.91);
    });
  }
  async function appendNotes(pdf,rows,p,meta,sourcePositions,basePages){
    if(!window.GnammaPdfUpgrade)throw Error('The private PDF Unicode extension did not load. Reload this page.');
    const upgrade=window.GnammaPdfUpgrade;
    const fonts=await upgrade.searchableFonts(pdf,URL_ROOT);
    await Promise.allSettled([
      document.fonts?.load('26px SourceSerif'),
      document.fonts?.load('29px Naskh')
    ]);
    const size=pdf.getPage(0).getSize();
    // Use the source PDF's page size, preserving A4 or other formats.
    let pageNum=1,sheet=blankCanvas(size);
    const pads=sheet.padding,maxWidth=sheet.W-pads*2,maxY=sheet.H-114;
    const pendingLinks=[],noteTargets=[];
    async function flush(){
      printFooter(sheet,pageNum);
      const bytes=await toJpeg(sheet.canvas),img=await pdf.embedJpg(bytes);
      const out=pdf.addPage([size.width,size.height]);
      out.drawImage(img,{x:0,y:0,width:size.width,height:size.height});
      // Preserve readable Arabic rendering while embedding searchable Unicode text.
      upgrade.textOverlay(pdf,out,sheet.searchLines,sheet,fonts);
      for(const record of sheet.links)pendingLinks.push({page:out,...record});
      pageNum++;sheet=blankCanvas(size);
      if(pageNum>260)throw Error('Appendix exceeds 260 pages. Export fewer notes.');
    }
    async function line(text,kind='body',indent=0,withLink=null){
      const s=String(text||'').trim();
      if(!s){sheet.y+=14;return;}
      const f=fontFor(s,kind==='link'?'meta':kind),c=sheet.c;c.font=f.font;
      const lines=linesFor(c,s,maxWidth-indent);
      for(let i=0;i<lines.length;i++){
        if(sheet.y+f.lh>maxY)await flush();
        const y=sheet.y,content=lines[i];
        c.save();c.font=f.font;c.fillStyle=kind==='link'?'#28636a':kind==='meta'?'#666':kind==='title'?'#243f45':'#272727';
        c.direction=f.rtl?'rtl':'ltr';c.textAlign=f.rtl?'right':'left';
        const startX=f.rtl?sheet.W-pads:pads+indent;
        c.fillText(content,startX,y);
        if(kind==='link'){
          const textW=Math.min(maxWidth-indent,c.measureText(content).width);
          c.strokeStyle='#397b7d';c.lineWidth=1;
          c.beginPath();
          c.moveTo(f.rtl?startX-textW:startX,y+3);
          c.lineTo(f.rtl?startX:startX+textW,y+3);c.stroke();
        }
        c.restore();
        sheet.searchLines.push({text:content,y,rtl:f.rtl,size:Number(f.font.match(/([\d.]+)px/)?.[1])||26,indent});
        if(withLink&&i===0){
          const textWidth=Math.min(maxWidth-indent,c.measureText(content).width+8);
          const x0=f.rtl?sheet.W-pads-textWidth:pads+indent;
          sheet.links.push({
            sourceIndex:withLink.index,
            sourceTop:withLink.top,
            rect:[x0/2,(sheet.H-y-8)/2,(x0+textWidth)/2,(sheet.H-y+f.lh-5)/2]
          });
        }
        sheet.y+=f.lh;
      }
    }
    await line('MY READING DESK · PERSONAL NOTES','title');
    await line('Reader-created observations · '+new Date().toLocaleDateString(),'meta');
    await line('P1, P2… identify YOUR personal notes — not publisher, editor or source references.','meta');
    await line('Select a P marker or highlighted phrase to visit its note; use Return to text to go back.','meta');
    sheet.y+=35;
    for(let i=0;i<rows.length;i++){
      const r=rows[i];
      const origin=sourcePositions[i]||{index:-1,top:82};
      const source=origin.index;
      if(sheet.y+155>maxY)await flush();
      noteTargets[i]={index:basePages+pageNum-1,top:Math.max(12,sheet.y/2-14)};
      await line('P'+(i+1)+' · '+nameOf(r.target),'title');
      await line(r.title|| (isNote(r)?'Personal note':'Saved quotation'),'meta');
      if(isNote(r)){
        for(const para of r.body.split(/\n/))await line(para);
      }else if(r.target?.quote){
        await line('Saved quotation: '+String(r.target.quote));
      }else if(r.body)for(const para of String(r.body).split(/\n/))await line(para);
      else if(r.archivedValue!==undefined)await line('Archived value: '+JSON.stringify(r.archivedValue));
      else await line('Saved bookmark / reference');
      if(r.target?.quote&&isNote(r))await line('Selected text: '+String(r.target.quote),'meta');
      if(p.dates)await line(dateLine(r),'meta');
      if(source>=0)await line('Return to original text · §'+r.target.section,'link',0,{index:source,top:origin.top});
      else await line('No source passage link · this is an appendix-only entry.','meta');
      sheet.y+=27;
      if(i%6===0){progress('Building notes appendix ('+(i+1)+'/'+rows.length+')…',45+35*(i+1)/rows.length);await new Promise(r=>setTimeout(r,0));}
    }
    await flush();
    for(const req of pendingLinks){
      const target=req.sourceIndex-1;
      if(target>=0&&target<basePages)makeLink(pdf,req.page,pdf.getPage(target),req.rect,req.sourceTop);
    }
    return {pages:pageNum-1,unsupported:[...fonts.missing],noteTargets};
  }
  async function loadPdfLib(){
    if(window.PDFLib?.PDFDocument)return;
    // Versions are pinned. Loading libraries does not transmit note content.
    // Never execute code fetched from a third party while handling private notes.
    // The audited pinned library is served alongside the static Gnamma website.
    const origins=[new URL('vendor/pdf-lib-1.17.1.min.js',URL_ROOT).href];
    for(const url of origins){
      try{
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');script.src=url;script.crossOrigin='anonymous';
          const timer=setTimeout(()=>{script.remove();reject(Error('PDF library timed out'));},15000);
          script.onload=()=>{clearTimeout(timer);resolve();};
          script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error('PDF library failed to load'));};
          document.head.append(script);
        });
        if(window.PDFLib?.PDFDocument)return;
      }catch(_){}
    }
    throw Error('The PDF library could not load. Check your network connection; the unchanged PDF is still available.');
  }
  async function checkedBytes(url,checksum){
    const res=await fetch(url,{cache:'no-cache'});
    if(!res.ok)throw Error('The published PDF could not be fetched (HTTP '+res.status+').');
    const bytes=await res.arrayBuffer();
    if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('The file returned is not a PDF.');
    if(checksum&&crypto?.subtle){
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      const actual=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
      if(actual!==checksum)throw Error('Edition files changed during export. Reload the page to avoid placing notes on incorrect pages.');
    }
    return bytes;
  }
  async function generate(file,rows,p){
    if(!manifest?.files?.[file])throw Error('Select a supported PDF edition.');
    if(!rows.length)throw Error('Choose at least one Reading Desk item, or select the unchanged PDF option.');
    if(rows.length>MAX_ITEMS)throw Error('Choose at most '+MAX_ITEMS+' items per PDF.');
    if(!p.annotations&&!p.appendix)throw Error('Enable annotations, the appendix, or both.');
    if(p.appendix&&rows.reduce((n,r)=>n+String(r.body||r.target?.quote||'').length,0)>220000)
      throw Error('Too much text for a mobile export. Choose fewer notes or use the A4 printing route.');
    if(requiresAppendix(rows,p))
      throw Error('One or more saved items are too long for PDF pop-up comments alone. Enable the full personal notes appendix to prevent text being omitted.');
    progress('Loading PDF processing library…',6);
    await loadPdfLib();
    progress('Checking source PDF and section map…',14);
    const metaResponse=await fetch(new URL('build/release/'+file+'.metadata.json',URL_ROOT),{cache:'no-cache'});
    if(!metaResponse.ok)throw Error('This PDF has no verified section map. Choose another edition or the unchanged file.');
    const metadata=await metaResponse.json();
    if(!metadata.section_pages||metadata.filename!==file)throw Error('Section map does not match the selected edition.');
    const docData=manifest.files[file];
    if(metadata.sha256!==docData.sha256)throw Error('The edition and its page map are out of sync. Reload later; the original PDF is available.');
    const bytes=await checkedBytes(fileUrl(file),docData.sha256);
    progress('Preparing annotations…',34);
    const pdf=await window.PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
    const basePageCount=pdf.getPageCount();
    const countByPage=new Map(),skipped=[],pinRows=[];
    const upgrade=window.GnammaPdfUpgrade;
    if(!upgrade)throw Error('Precise PDF annotation component is missing. Reload the page.');
    let wordMap=null,precise=0;
    if(p.annotations&&rows.some(r=>r.target?.kind==='quote')){
      try{
        const mapResp=await fetch(new URL('personal-anchor-maps/'+file+'.json',URL_ROOT),{cache:'no-cache'});
        if(mapResp.ok){
          const candidate=await mapResp.json();
          if(candidate.source_sha256===metadata.sha256&&candidate.coverage>=0.92&&candidate.segments)
            wordMap=candidate;
        }
      }catch(_){/* Use verified section fallback; never guess word geometry. */}
    }
    if(p.annotations){
      for(let i=0;i<rows.length;i++){
        const r=rows[i],sectionIndex=verifiedPage(r.target?.section,metadata,basePageCount);
        if(sectionIndex<0){skipped.push(i);continue;}
        const target=r.target||{},tag=target.lang==='ar'?
          (file==='daruri-arabic-vowelled.pdf'||file==='daruri.pdf'||file==='daruri-study.pdf'?'vocalized':'ar'):'en';
        const key=[target.section,target.segment,tag].join(':');
        const words=wordMap?.segments?.[key]||[];
        let hit=target.kind==='quote'?upgrade.sourceMatch(words,target):null;
        if(hit&&(!Number.isInteger(hit.page)||hit.page<1||hit.page>basePageCount))hit=null;
        const index=hit?hit.page-1:sectionIndex;
        const slot=countByPage.get(index)||0,count=slot+1;
        countByPage.set(index,count);
        const content=entryText(r,i,p.dates);
        if(notePin(pdf,pdf.getPage(index),i+1,content,slot)){
          pinRows.push(i);
          if(hit&&upgrade.addHighlight(pdf,pdf.getPage(index),hit,content,'Reading Desk '+(i+1)))precise++;
        }else skipped.push(i);
      }
    }
    if(!p.appendix&&skipped.length)throw Error(skipped.length+' selected items have no safe in-text PDF comment location. Include the appendix so none of your notes are lost.');
    progress('Preparing appendix pages…',45);
    const appendix=p.appendix?await appendNotes(pdf,rows,p,metadata):{pages:0,unsupported:[]};
    const pages=appendix.pages;
    progress('Saving your personal PDF…',88);
    pdf.setTitle('Al-Ḍarūrī — Personal Reading Desk Edition');
    pdf.setSubject('Reader-authored PDF comments and personal notes. Not part of original or editorial text.');
    pdf.setCreator('Gnamma Research — browser-local personal export');
    const saved=await pdf.save({useObjectStreams:false});
    if(saved.length>90*1024*1024)throw Error('The resulting PDF is over 90 MB. Please choose fewer items.');
    return {blob:new Blob([saved],{type:'application/pdf'}),pages,annotated:pinRows.length,precise,unmapped:skipped.length,unsupported:appendix.unsupported,hadWordMap:!!wordMap};
  }
  function startResult(blob,name){
    if(resultURL)URL.revokeObjectURL(resultURL);
    resultURL=URL.createObjectURL(blob);resultFile=blob;lastFilename=name;
    const a=$('pe-result-link');a.href=resultURL;a.download=name;
    $('pe-open').href=resultURL;$('pe-result').hidden=false;
    const share=$('pe-share');share.hidden=!(navigator.share&&typeof File!=='undefined');
    const link=document.createElement('a');link.href=resultURL;link.download=name;
    document.body.append(link);link.click();link.remove();
  }
  async function sharePdf(){
    if(!resultFile||!navigator.share||typeof File==='undefined')return;
    const file=new File([resultFile],lastFilename,{type:'application/pdf'});
    if(navigator.canShare&&!navigator.canShare({files:[file]})){info('File sharing is unavailable on this device. Use Download PDF instead.');return;}
    try{await navigator.share({files:[file],title:'Personal Darūrī PDF'});}
    catch(error){if(error.name!=='AbortError')showError('Device sharing failed. The download link is still available.');}
  }
  async function submit(event){
    event.preventDefault();if(busy)return;
    const file=$('pe-edition').value;
    if(!manifest?.files?.[file])return showError('Please choose an available edition.');
    if(mode()==='none'){window.location.assign(fileUrl(file));return;}
    const rows=matching(),p=prefs();
    busy=true;$('pe-result').hidden=true;info('');syncForm();
    try{
      const {blob,pages,annotated,precise,unmapped,unsupported,hadWordMap}=await generate(file,rows,p);
      const stem=file.replace(/\.pdf$/,'');
      startResult(blob,stem+'-personal-'+new Date().toISOString().slice(0,10)+'.pdf');
      info(rows.length+' item'+(rows.length===1?'':'s')+' included; '+annotated+' source-page PDF comment'+(annotated===1?'':'s')+
        '; '+precise+' precise word highlight'+(precise===1?'':'s')+'; '+pages+' searchable appendix page'+(pages===1?'':'s')+'.'+
        (unmapped?' '+unmapped+' item'+(unmapped===1?'':'s')+' had no safe PDF pin; see appendix.':'')+
         (unsupported.length?' Some rare symbols may not be searchable: '+unsupported.slice(0,7).join(' ')+'.':'')+
        (hadWordMap?'':' Exact-word map unavailable; notes safely attach to their sections.')+
        ' On iPhone/iPad, use Open or Share if automatic downloading was blocked.');
      progress('Personal PDF generated on this device.',100);
    }catch(error){showError('PDF export failed: '+(error?.message||error)+'. The original PDF and your Reading Desk are unchanged.');$('pe-progress').hidden=true;}
    finally{busy=false;syncForm();}
  }
  async function init(){
    records=loadDesk();selectedIds=new Set(records.map(r=>r.id));
    try{
      const res=await fetch(new URL('pdf-editions-manifest.json',URL_ROOT),{cache:'no-cache'});
      if(!res.ok)throw Error('Edition list unavailable (HTTP '+res.status+')');
      const data=await res.json();
      if(!data.files||!data.default_pdf)throw Error('Edition list is incomplete');
      manifest=data;
      const entries=Object.entries(data.files).filter(([file,x])=>/^[a-z0-9-]+\.pdf$/.test(file)&&x?.sha256&&x?.pages);
      $('pe-edition').replaceChildren();
      const labels={ 'daruri.pdf':'Scholarly reference · bilingual',
        'daruri-study.pdf':'Study · bilingual','daruri-english.pdf':'Reading · English',
        'daruri-arabic.pdf':'Reading · Arabic','daruri-arabic-vowelled.pdf':'Reading · Arabic (fully vowelled)' };
      for(const [file,x] of entries){
        const op=document.createElement('option');op.value=file;
        op.textContent=(labels[file]||x.title||file)+' · '+x.pages+' pages';
        $('pe-edition').append(op);
      }
      $('pe-edition').value=entries.some(([f])=>f===data.default_pdf)?data.default_pdf:entries[0]?.[0]||'';
      if(!$('pe-edition').value)throw Error('No published editions available');
    }catch(error){showError('Could not load the edition list: '+error.message);$('pe-edition').innerHTML='<option value="">Edition list unavailable</option>';}
    document.querySelectorAll('input[name="pe-mode"]').forEach(e=>e.addEventListener('change',syncForm));
    ['pe-edition','pe-personal','pe-bookmarks','pe-annotations','pe-appendix','pe-dates','pe-order'].forEach(id=>$(id).addEventListener('change',syncForm));
    $('pe-search').addEventListener('input',renderPicker);
    $('pe-items').addEventListener('change',e=>{const id=e.target?.dataset?.noteId;if(id){if(e.target.checked)selectedIds.add(id);else selectedIds.delete(id);$('pe-result').hidden=true;info('');syncForm();}});
    $('pe-check-all').addEventListener('click',()=>{available(records,prefs()).forEach(r=>selectedIds.add(r.id));$('pe-result').hidden=true;info('');syncForm();});
    $('pe-check-none').addEventListener('click',()=>{selectedIds.clear();$('pe-result').hidden=true;info('');syncForm();});
    // Other tabs can update the local Reading Desk; never export stale selections.
    window.addEventListener('storage',e=>{
      if(e.key!==STORAGE)return;
      records=loadDesk();
      const activeIds=new Set(records.map(r=>r.id));
      selectedIds=new Set([...selectedIds].filter(id=>activeIds.has(id)));
      $('pe-result').hidden=true;
      syncForm();
      info('Reading Desk data changed in another tab. Check your selected notes before exporting.');
    });
    $('pe-form').addEventListener('submit',submit);
    $('pe-share').addEventListener('click',sharePdf);
    syncForm();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();