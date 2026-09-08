'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, LockKeyhole, UnlockKeyhole, Pencil, Eye } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { flushSync } from 'react-dom';
export default function Home(){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),request=useRef(0),url=useRef(''),drag=useRef<{id:number;x:number;y:number;ox:number;oy:number}|null>(null);
 const [camera,C]=useState(false),[busy,B]=useState(false),[message,M]=useState(''),[photo,P]=useState(''),[locked,L]=useState(false),[hidden,H]=useState(false),[opacity,O]=useState(45),[scale,S]=useState(100),[rotation,R]=useState(0),[pos,Q]=useState({x:0,y:0});
 useEffect(()=>()=>{request.current++;stream.current?.getTracks().forEach(t=>t.stop());if(url.current)URL.revokeObjectURL(url.current)},[]);
 function stop(){request.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;if(video.current)video.current.srcObject=null;C(false);B(false);L(false)}
 async function start(){if(!navigator.mediaDevices?.getUserMedia){M('請用手機 Safari 或 Chrome 開啟 HTTPS 網址，才能使用相機。');return}const ticket=++request.current;B(true);M('');try{const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}},audio:false});if(ticket!==request.current){next.getTracks().forEach(t=>t.stop());return}stream.current=next;if(video.current){video.current.srcObject=next;await video.current.play()}if(ticket===request.current)C(true);next.getVideoTracks()[0]?.addEventListener('ended',()=>{if(stream.current===next){stop();M('相機已中斷，請重新開啟。')}})}catch(e){if(ticket!==request.current)return;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;C(false);M(e instanceof DOMException&&e.name==='NotAllowedError'?'請在瀏覽器的網站設定允許相機權限，再試一次。':'無法啟動相機，請確認裝置有相機，並關閉其他使用相機的程式。')}finally{if(ticket===request.current)B(false)}}
 function reset(){S(100);R(0);Q({x:0,y:0})}
 function load(file?:File){if(!file)return;if(file.size>25*1024*1024){M('請選擇 25 MB 以內的圖片。');return}const next=URL.createObjectURL(file),img=new Image();img.onload=()=>{if(url.current)URL.revokeObjectURL(url.current);url.current=next;P(next);reset();H(false);M('')};img.onerror=()=>{URL.revokeObjectURL(next);M('無法讀取圖片，請改用 JPG、PNG 或 WebP。')};img.src=next}
 const state=useRef({photo,locked});state.current={photo,locked};
 useEffect(()=>{
  const context=(document as Document & {modelContext?:{registerTool:(tool:object,options:{signal:AbortSignal})=>unknown}}).modelContext;
  if(!context)return;const lifecycle=new AbortController();
  try{Promise.resolve(context.registerTool({name:'configure_reference_opacity',description:'Set the visible reference image opacity, including while its position is locked.',inputSchema:{type:'object',properties:{opacity:{type:'number',minimum:5,maximum:100}},required:['opacity'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){const value=(input as {opacity?:unknown})?.opacity;if(typeof value!=='number'||!Number.isFinite(value)||value<5||value>100)throw new Error('Opacity must be between 5 and 100.');if(!state.current.photo)throw new Error('Choose a reference image first.');flushSync(()=>O(value));return {opacity:value}}},{signal:lifecycle.signal})).catch(()=>{})}catch{}return()=>lifecycle.abort();
 },[]);
 const disabled=!photo||locked;
 return <main><header><div className="brand"><span><Pencil size={22}/></span><h1>描描 <small>相機描圖</small></h1></div><p>照片留在你的裝置</p></header><div className="workspace"><section><div className="view-heading"><span>{camera?'● 相機已開啟':'○ 準備畫紙與手機支架'}</span><span>{locked?'位置已鎖定':'調整模式'}</span></div><div className={'viewport '+(locked?'locked':'')} tabIndex={photo&&!locked?0:-1} role="region" aria-label="拖曳參考圖片，或使用方向鍵移動"
 onKeyDown={e=>{if(disabled)return;const d:Record<string,[number,number]>={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};if(d[e.key]){e.preventDefault();const [x,y]=d[e.key];Q(p=>({x:p.x+x,y:p.y+y}))}}}
 onPointerDown={e=>{if(disabled||drag.current)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,ox:pos.x,oy:pos.y}}}
 onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId||locked)return;Q({x:d.ox+e.clientX-d.x,y:d.oy+e.clientY-d.y})}}
 onPointerUp={()=>{drag.current=null}} onPointerCancel={()=>{drag.current=null}} onLostPointerCapture={()=>{drag.current=null}}>
 <video ref={video} muted playsInline autoPlay style={{visibility:camera?'visible':'hidden'}}/>
 {!camera&&!photo&&<div className="empty"><Camera size={42} strokeWidth={1.2}/><h2>把想畫的，放到紙上</h2><p>固定手機，讓後置鏡頭對準畫紙。<br/>開啟相機，再選一張想描繪的圖片。</p></div>}
 {photo&&<img className="reference" src={photo} alt="描圖參考圖片" draggable={false} style={{opacity:hidden?0:opacity/100,transform:`translate(-50%,-50%) translate(${pos.x}px,${pos.y}px) rotate(${rotation}deg) scale(${scale/100})`}}/>}
 <div className="view-note">{locked?'位置已鎖定 · 看著螢幕，慢慢描繪':photo?'拖曳圖片，對齊想畫的位置':'圖案顯示在螢幕中，不會投影到紙上'}</div></div><p className="setup">{locked?'請保持手機、紙張與螢幕方向不變；移動後需解鎖重新對齊。':'先固定手機和畫紙，再調整圖片。建議關閉螢幕自動旋轉。'}</p></section>
 <aside aria-label="描圖控制"><section className="controls"><h2><span>01</span>準備開始</h2><button className="button primary" disabled={busy} onClick={camera?stop:start}><Camera size={19}/>{busy?'正在開啟相機…':camera?'關閉相機':'開啟相機'}</button><label className={'button secondary upload '+(locked?'disabled':'')}><ImagePlus size={19}/>{photo?'更換參考圖片':'選擇參考圖片'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={locked} onChange={e=>{load(e.target.files?.[0]);e.target.value=''}}/></label><p className="help">選擇輪廓清楚的圖片，會更容易描繪。</p></section>
 {message&&<p className="error" role="alert">{message}</p>}
 <section className="controls"><h2><span>02</span>對齊參考圖<button className="reset" disabled={disabled} onClick={reset}>重設</button></h2>
 <div className="range"><div><label id="opacity">不透明度</label><output>{opacity}%</output></div><Slider aria-labelledby="opacity" value={[opacity]} min={5} max={100} disabled={!photo} onValueChange={v=>O(Array.isArray(v)?v[0]:v)}/></div>
 <div className="range"><div><label id="scale">圖片大小</label><output>{scale}%</output></div><Slider aria-labelledby="scale" value={[scale]} min={20} max={300} disabled={disabled} onValueChange={v=>S(Array.isArray(v)?v[0]:v)}/></div>
 <div className="range"><div><label id="rotation">旋轉</label><output>{rotation}°</output></div><Slider aria-labelledby="rotation" value={[rotation]} min={-180} max={180} disabled={disabled} onValueChange={v=>R(Array.isArray(v)?v[0]:v)}/></div>
 <button className="button secondary" disabled={!photo} aria-pressed={hidden} onClick={()=>H(!hidden)}><Eye size={18}/>{hidden?'顯示參考圖':'暫時隱藏，看看筆跡'}</button></section>
 <section className="finish"><button className={'button lock '+(locked?'active':'')} disabled={!photo||!camera} onClick={()=>{drag.current=null;L(!locked)}}>{locked?<UnlockKeyhole size={20}/>:<LockKeyhole size={20}/>} {locked?'解鎖，重新調整':'鎖定位置，開始畫'}</button><p className="help">{locked?'位置已鎖定，仍可調整不透明度。':'開啟相機並選擇圖片後，就能鎖定。'}</p></section></aside></div><footer>不急著畫得完美，先享受每一筆。</footer></main>
}
