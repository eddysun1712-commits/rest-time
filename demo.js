import { normalizeBatch } from './data.js';
// Explicit synthetic output fixtures. Not camera inference or a trained wrist model.
const DEMO_PAIRS=[[18,20],[20,21],[17,23],[22,20],[24,25],[28,29],[32,30],[36,34],[42,39],[47,45],[51,48],[48,46],[null,50],[null,53],[55,56],[60,61],[66,65],[72,71],[76,74],[79,77],[82,80],[75,null],[null,null],[58,55],[48,44],[38,35],[30,29],[27,25],[23,24],[21,20],[20,22],[19,21]];
export function demoWindows(base){
 return DEMO_PAIRS.map(([camera,wrist],i)=>{
  const metadata={session_id:'synthetic-demo',window_start_utc:new Date(base+i*60000).toISOString(),window_end_utc:new Date(base+(i+1)*60000).toISOString()};
  const source=(v,module)=>({...metadata,module,valid:v!==null,need_rest_probability_percent:v,quality_score:v===null?0:module==='camera'?0.85:0.9,reason_codes:v===null?['demo_signal_loss']:['synthetic_demo']});
  return {...metadata,camera_result:source(camera,'camera'),physiology_result:source(wrist,'physiology')};
 });
}
export function replayDemo(base,count){
 const windows=demoWindows(base).slice(0,count);return {windows,samples:windows.length?normalizeBatch(windows):[],decision:fusionDecision(windows)};
}
// Port of uploaded fusion.py: quality-weighted 0.4/0.6 mean, three-window persistence.
export function fusionDecision(windows){
 let history=[],last={valid:false,status:'insufficient_data',probability:null};
 for(const row of windows){
  const pairs=[[row.camera_result,0.4],[row.physiology_result,0.6]].filter(([s])=>s?.valid===true&&typeof s.need_rest_probability_percent==='number'&&s.need_rest_probability_percent>=0&&s.need_rest_probability_percent<=100&&s.quality_score>0&&s.quality_score<=1);
  if(!pairs.length){history=[];last={valid:false,status:'insufficient_data',probability:null};continue;}
  const weight=pairs.reduce((sum,[s,w])=>sum+s.quality_score*w,0);
  const p=Math.round(pairs.reduce((sum,[s,w])=>sum+s.need_rest_probability_percent*s.quality_score*w,0)/weight*10)/10;
  history=[...history,p].slice(-3);
  const status=history.length===3&&history.every(v=>v>=60)?'break_recommended':p>=40?'watch':history.length===3&&history.every(v=>v<35)?'recovered_or_normal':'normal';
  last={valid:true,status,probability:p,quality:weight,history_length:history.length};
 }
 return last;
}
