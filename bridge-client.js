import { validateAIResponse } from './assistant.js';
export const BRIDGE_URL='https://rest-time-private-bridge.eddysun1712.chatgpt.site';
export function bridgeReady(){return true;}
export function connectBridge(){return Promise.resolve();}
export async function bridgeRequest(context,signal){
 const input=structuredClone(context);
 input.conversation=input.conversation.map(m=>({...m,content:String(m.content).slice(0,1200)}));
 while(new TextEncoder().encode(JSON.stringify({context:input})).length>60000&&input.conversation.length)input.conversation.shift();
 const response=await fetch(BRIDGE_URL+'/api/chat',{method:'POST',credentials:'omit',redirect:'error',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({context:input})}).catch(error=>{if(error.name==='AbortError')throw error;throw Object.assign(new Error('aiNetwork'),{code:'aiNetwork'});});
 if(!response.ok)throw Object.assign(new Error('aiHTTP'),{code:response.status===429?'aiRateLimit':response.status===401||response.status===403?'aiUnauthorized':'aiHTTP'});
 const body=await response.json();return validateAIResponse(body.result,context.event,context.language);
}
