'use strict';
/* Browser regression for Backup & Transfer and user-initiated Google Drive
 * transport. All Google requests and OAuth responses are mocked; no real
 * accounts, Drive files or reader collections are modified.
 */
const {spawn}=require('node:child_process');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../..');
function execute(file,env){
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.join(__dirname,file)],{cwd:ROOT,env,stdio:['ignore','pipe','pipe']});
  let log='';
  for(const stream of [child.stdout,child.stderr])stream.on('data',buf=>{
   const text=String(buf);log+=text;process.stdout.write(text);
  });
  child.on('error',reject);
  child.on('close',code=>code===0?resolve():reject(Error(file+' failed with code '+code)));
 });
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
(async()=>{
 const server=spawn('python3',['-m','http.server','8898','--bind','127.0.0.1'],{cwd:ROOT,stdio:'ignore'});
 try{
  await sleep(1000);
  const env={...process.env,GNAMMA_QA_BASE_URL:'http://127.0.0.1:8898/daruri/'};
  await execute('verify-backup-transfer-ui.cjs',env);
  await execute('verify-backup-transfer-google-mock.cjs',env);
  console.log('PASS Backup & Transfer browser QA (local-first, no live Google account)');
 }finally{server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1});
