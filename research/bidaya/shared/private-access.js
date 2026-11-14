(()=>{
 const form=document.getElementById('unlock-form'),status=document.getElementById('unlock-status');
 const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const base64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
 const script=new URL(document.currentScript.src),payloadURL=new URL('private-reader.enc.json',script);
 let payload;
 async function unlock(password,cached){
  status.textContent='Opening reader…';form.querySelector('button').disabled=true;
  try{
   payload??=await fetch(payloadURL,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('network');return r.json()});
   let raw;
   if(cached&&cached.salt===payload.salt)raw=bytes(cached.key);
   else {const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);raw=await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,256);}
   const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
   const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.nonce),additionalData:new TextEncoder().encode('bidaya-private-v1')},key,bytes(payload.ciphertext));
   const docs=JSON.parse(await new Response(new Blob([clear]).stream().pipeThrough(new DecompressionStream('gzip'))).text()),content=docs[document.body.dataset.privateGate];if(!content)throw Error('missing');
   sessionStorage.setItem('bidaya-private-key',JSON.stringify({salt:payload.salt,key:base64(raw)}));
   document.open();document.write('<!doctype html>'+content);document.close();
  }catch(e){sessionStorage.removeItem('bidaya-private-key');status.textContent=e.message==='network'?'The reader could not be downloaded. Please try again.':'The password did not unlock this edition. Please try again.';form.querySelector('button').disabled=false;document.getElementById('reader-password').focus();}
 }
 form.addEventListener('submit',e=>{e.preventDefault();unlock(document.getElementById('reader-password').value)});
 try{const cached=JSON.parse(sessionStorage.getItem('bidaya-private-key'));if(cached)unlock('',cached);}catch{}
})();
