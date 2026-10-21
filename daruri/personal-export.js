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
  const isNote=r=>r&&r.kind==='note'&&typeof r.body==='string'&&r.body.trim().length>0;
  const isBookmark=r=>r&&r.kind!=='note'&&r.target&&typeof r.target==='object';
  function available(records,prefs){
    return records.filter(r=>r&&!r.deleted&&r.target!==undefined&&(
      (prefs.personal&&isNote(r))||(prefs.bookmarks&&isBookmark(r))
    ));
  }
  function loadDesk(){
    try{
      const raw=localStorage.getItem(STORAGE);
      if(!raw)return [];
      const data=JSON.parse(raw);
      if(data?.format!=='gnamma-reading-desk'||data.version!==1||!Array.isArray(data.items))throw Error('Unknown Reading Desk backup format');
      return data.items.slice(0,3000).filter(r=>r&&typeof r==='object'&&!Array.isArray(r)
        &&typeof r.kind==='string'&&(!r.target||typeof r.target==='object')
        &&(r.kind!=='note'||typeof r.body==='string')).map(r=>({
        id:cap(r.id,100),kind:cap(r.kind,40),
        title:cap(r.title,240),body:r.kind==='note'?cap(r.body,30000):'',
        target:r.target||null,standalone:Boolean(r.standalone),deleted:Number(r.deleted)||0,
        created:Number(r.created)||0,modified:Number(r.modified)||0,updated:Number(r.updated)||0,
        dateSource:cap(r.dateSource,30)
      }));
    }catch(error){showError('Your Reading Desk could not be read in this browser: '+error.message+'. Your original data has not been changed.');return [];}
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
    const text=isNote(r)?r.body:(r.target?.quote||'Saved passage / bookmark');
    const quote=r.target?.quote&&isNote(r)?'\nSelected text: '+cap(r.target.quote,1000):'';
    return h+'\n'+title+'\n'+cap(text,30000)+quote+(dates?'\n'+dateLine(r):'');
  }
  function verifiedPage(section,metadata,pdfPages){
    if(!/^\d{1,3}$/.test(String(section||'')))return -1;
    const n=Number(metadata?.section_pages?.[String(section)]);
    return Number.isInteger(n)&&n>0&&n<=pdfPages?n-1:-1;
  }
  const model={available,orderItems,dateLine,entryText,verifiedPage,isNote,isBookmark};
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
  function syncForm(){
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
    $('pe-generate').disabled=busy||!pdf|| (has&&(!rows.length||(!p.appendix&&!p.annotations)||rows.length>MAX_ITEMS));
    if(has&&rows.length>MAX_ITEMS)$('pe-count').textContent+=' · Too many for one export. Choose up to '+MAX_ITEMS+' items.';
    if(mode()==='choose')renderPicker();
    if(!has)info('');
  }
  function renderPicker(){
    const p=prefs(),eligible=available(records,p),q=String($('pe-search').value||'').toLowerCase().trim();
    const visible=eligible.filter(r=>!q||[r.title,r.body,r.target?.quote,nameOf(r.target)].join(' ').toLowerCase().includes(q));
    const root=$('pe-items');root.replaceChildren();
    for(const r of visible){
      const label=document.createElement('label');label.className='item';
      const check=document.createElement('input');check.type='checkbox';check.checked=selectedIds.has(r.id);
      check.dataset.noteId=r.id;
      const text=document.createElement('span');
      text.className='item-title';text.textContent=(r.title||nameOf(r.target)).slice(0,120);
      const meta=document.createElement('small');meta.textContent=nameOf(r.target)+(isNote(r)?' · Personal note':' · Bookmark');
      text.append(meta);label.append(check,text);root.append(label);
    }
    $('pe-picker-count').textContent=selectedIds.size+' selected · '+visible.length+' matching / '+eligible.length+' qualifying items';
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
    return {canvas,c,W:canvas.width,H:canvas.height,padding:76,y:115,links:[]};
  }
  function fontFor(s,kind){
    if(/[\u0600-\u06ff]/.test(s))return {font:(kind==='title'?'bold ':'')+'29px Naskh, serif',rtl:true,lh:49};
    return {font:(kind==='title'?'bold 30px SourceSerif, Georgia, serif':kind==='meta'?'21px sans-serif':'26px SourceSerif, Georgia, serif'),rtl:false,lh:kind==='title'?40:kind==='meta'?32:39};
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
  function attach(pdf,page,dict){
    const {PDFName,PDFArray}=window.PDFLib;
    const context=pdf.context,ref=context.register(context.obj(dict)),key=PDFName.of('Annots');
    let annots=page.node.lookup(key,PDFArray);
    if(!annots){annots=context.obj([]);page.node.set(key,annots);}
    annots.push(ref);return ref;
  }
  function notePin(pdf,page,number,popup,index){
    const {PDFName,PDFHexString}=window.PDFLib;
    const size=page.getSize();const height=Math.max(180,size.height-80);
    const count=Math.max(1,Math.floor(height/18));
    const col=Math.floor(index/count),row=index%count;
    if(col>=3)return false; // Always in appendix even if a page is too crowded.
    const x=Math.max(3,size.width-22-col*16),y=Math.max(28,size.height-53-row*18);
    attach(pdf,page,{
      Type:PDFName.of('Annot'),Subtype:PDFName.of('Text'),
      Rect:[x,y,x+12,y+12],
      Contents:PDFHexString.fromText('Reading Desk #'+number+'\n'+(popup.length>24000?popup.slice(0,23930)+'\n[More in the personal appendix]':popup)),
      T:PDFHexString.fromText('Personal note '+number),
      Name:PDFName.of('Comment'),C:[0.18,0.35,0.42],F:4,Open:false
    });
    return true;
  }
  function makeLink(pdf,page,sourcePage,rect){
    const {PDFName}=window.PDFLib;
    attach(pdf,page,{Type:PDFName.of('Annot'),Subtype:PDFName.of('Link'),
      Rect:rect,Border:[0,0,0],Dest:pdf.context.obj([sourcePage.ref,PDFName.of('Fit')]),F:4});
  }
  async function toJpeg(canvas){
    return new Promise((resolve,reject)=>{
      canvas.toBlob(blob=>blob?blob.arrayBuffer().then(resolve,reject):reject(Error('Cannot encode appendix page')),
        'image/jpeg',0.91);
    });
  }
  async function appendNotes(pdf,rows,p,meta){
    await Promise.allSettled([
      document.fonts?.load('26px SourceSerif'),
      document.fonts?.load('29px Naskh')
    ]);
    const size=pdf.getPage(0).getSize();
    // Use the source PDF's page size, preserving A4 or other formats.
    let pageNum=1,sheet=blankCanvas(size);
    const pads=sheet.padding,maxWidth=sheet.W-pads*2,maxY=sheet.H-114;
    const pendingLinks=[];
    async function flush(){
      printFooter(sheet,pageNum);
      const bytes=await toJpeg(sheet.canvas),img=await pdf.embedJpg(bytes);
      const out=pdf.addPage([size.width,size.height]);
      out.drawImage(img,{x:0,y:0,width:size.width,height:size.height});
      for(const record of sheet.links)pendingLinks.push({page:out,...record});
      pageNum++;sheet=blankCanvas(size);
      if(pageNum>260)throw Error('Appendix exceeds 260 pages. Export fewer notes.');
    }
    async function line(text,kind='body',indent=0,withLink=null){
      const s=String(text||'').trim();
      if(!s){sheet.y+=14;return;}
      const f=fontFor(s,kind),c=sheet.c;c.font=f.font;
      const lines=linesFor(c,s,maxWidth-indent);
      for(let i=0;i<lines.length;i++){
        if(sheet.y+f.lh>maxY)await flush();
        const y=sheet.y,content=lines[i];
        c.save();c.font=f.font;c.fillStyle=kind==='meta'?'#666':kind==='title'?'#243f45':'#272727';
        c.direction=f.rtl?'rtl':'ltr';c.textAlign=f.rtl?'right':'left';
        c.fillText(content,f.rtl?sheet.W-pads: pads+indent,y);c.restore();
        if(withLink&&i===0)sheet.links.push({
          sourceIndex:withLink,
          rect:[(pads+indent)/2,(sheet.H-y-10)/2,Math.min(sheet.W-pads,(pads+indent+maxWidth))/2,(sheet.H-y+f.lh-4)/2]
        });
        sheet.y+=f.lh;
      }
    }
    await line('PERSONAL READING DESK · AL-ḌARŪRĪ','title');
    await line('Reader-created observations · '+new Date().toLocaleDateString(),'meta');
    await line('Personal notes are separate from the author’s text and the editorial apparatus.','meta');
    await line('PDF comment icons, where included, point to numbered source sections.','meta');
    sheet.y+=35;
    const sourcePages=[];
    for(let i=0;i<rows.length;i++){
      const r=rows[i],source=verifiedPage(r.target?.section,meta,pdf.getPageCount());
      sourcePages[i]=source;
      if(sheet.y+155>maxY)await flush();
      await line((i+1)+'. '+nameOf(r.target),'title',0,source>=0?source+1:null);
      await line(r.title|| (isNote(r)?'Personal note':'Saved quotation'),'meta');
      if(isNote(r)){
        for(const para of r.body.split(/\n/))await line(para);
      }else if(r.target?.quote){
        await line('Saved quotation: '+cap(r.target.quote,5000));
      }else await line('Saved bookmark / reference');
      if(r.target?.quote&&isNote(r))await line('Selected text: '+cap(r.target.quote,1500),'meta');
      if(p.dates)await line(dateLine(r),'meta');
      if(source<0)await line('No safe page anchor; included in the appendix only.','meta');
      sheet.y+=27;
      if(i%6===0){progress('Building notes appendix ('+(i+1)+'/'+rows.length+')…',45+35*(i+1)/rows.length);await new Promise(r=>setTimeout(r,0));}
    }
    await flush();
    for(const req of pendingLinks){
      const target=req.sourceIndex-1;
      if(target>=0&&target<pdf.getPageCount())makeLink(pdf,req.page,pdf.getPage(target),req.rect);
    }
    return pageNum-1;
  }
  async function loadPdfLib(){
    if(window.PDFLib?.PDFDocument)return;
    // Versions are pinned. Loading libraries does not transmit note content.
    const origins=[
      'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
      'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
    ];
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
    if(p.annotations){
      for(let i=0;i<rows.length;i++){
        const r=rows[i],index=verifiedPage(r.target?.section,metadata,basePageCount);
        if(index<0){skipped.push(i);continue;}
        const slot=countByPage.get(index)||0,count=slot+1;
        countByPage.set(index,count);
        if(notePin(pdf,pdf.getPage(index),i+1,entryText(r,i,p.dates),slot))pinRows.push(i);
        else skipped.push(i);
      }
    }
    if(!p.appendix&&skipped.length)throw Error(skipped.length+' selected items have no safe in-text PDF comment location. Include the appendix so none of your notes are lost.');
    progress('Preparing appendix pages…',45);
    const pages=p.appendix?await appendNotes(pdf,rows,p,metadata):0;
    progress('Saving your personal PDF…',88);
    pdf.setTitle('Al-Ḍarūrī — Personal Reading Desk Edition');
    pdf.setSubject('Reader-authored PDF comments and personal notes. Not part of original or editorial text.');
    pdf.setCreator('Gnamma Research — browser-local personal export');
    const saved=await pdf.save({useObjectStreams:false});
    if(saved.length>90*1024*1024)throw Error('The resulting PDF is over 90 MB. Please choose fewer items.');
    return {blob:new Blob([saved],{type:'application/pdf'}),pages,annotated:pinRows.length,unmapped:skipped.length};
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
      const {blob,pages,annotated,unmapped}=await generate(file,rows,p);
      const stem=file.replace(/\.pdf$/,'');
      startResult(blob,stem+'-personal-'+new Date().toISOString().slice(0,10)+'.pdf');
      info(rows.length+' item'+(rows.length===1?'':'s')+' included; '+annotated+' source-page PDF comment'+(annotated===1?'':'s')+
        '; '+pages+' printable appendix page'+(pages===1?'':'s')+'.'+
        (unmapped?' '+unmapped+' item'+(unmapped===1?'':'s')+' had no safe PDF pin; see appendix.':'')+
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
    $('pe-items').addEventListener('change',e=>{const id=e.target?.dataset?.noteId;if(id){if(e.target.checked)selectedIds.add(id);else selectedIds.delete(id);syncForm();}});
    $('pe-check-all').addEventListener('click',()=>{available(records,prefs()).forEach(r=>selectedIds.add(r.id));syncForm();});
    $('pe-check-none').addEventListener('click',()=>{selectedIds.clear();syncForm();});
    $('pe-form').addEventListener('submit',submit);
    $('pe-share').addEventListener('click',sharePdf);
    syncForm();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();