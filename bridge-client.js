import { validateAIResponse } from './assistant.js';
export const BRIDGE_URL='https://rest-time-private-bridge.eddysun1712.chatgpt.site';
let bridgeWindow=null,connected=false;
const pending=new Map();
export function bridgeReady(){return connected&&bridgeWindow&&!bridgeWindow.closed;}
export function connectBridge(){connected=false;bridgeWindow=window.open(BRIDGE_URL,'rest-time-ai','popup,width=520,height=620');if(!bridgeWindow)throw Object.assign(new Error('aiNetwork'),{code:'aiNetwork'});}
window.addEventListener('message',event=>{
 if(event.origin!==BRIDGE_URL||event.source!==bridgeWindow)return;
 const data=event.data;if(!data||data.channel!=='rest-time-ai-v1')return;
 if(data.type==='ready'){if(!connected){connected=true;window.dispatchEvent(new Event('rest-time-ai-ready'));}return;}
 const request=pending.get(data.id);if(!request)return;
 if(data.type==='response'){try{request.resolve(validateAIResponse(data.result,request.context.event,request.context.language));}catch(error){request.reject(error);}}
 else if(data.type==='error')request.reject(Object.assign(new Error('aiHTTP'),{code:['aiUnauthorized','aiRateLimit','aiTimeout','aiInvalid'].includes(data.code)?data.code:'aiHTTP'}));
});
export function bridgeRequest(context,signal){
 if(!bridgeReady())return Promise.reject(Object.assign(new Error('aiNeedsKey'),{code:'aiNeedsKey'}));
 return new Promise((resolve,reject)=>{const id=crypto.randomUUID();let timer;const finish=(fn,value)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);pending.delete(id);fn(value);};const abort=()=>{bridgeWindow?.postMessage({channel:'rest-time-ai-v1',type:'cancel',id},BRIDGE_URL);finish(reject,new DOMException('Aborted','AbortError'));};if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(reject,Object.assign(new Error('aiTimeout'),{code:'aiTimeout'})),55000);pending.set(id,{context,resolve:value=>finish(resolve,value),reject:error=>finish(reject,error)});bridgeWindow.postMessage({channel:'rest-time-ai-v1',type:'request',id,context},BRIDGE_URL);});
}
