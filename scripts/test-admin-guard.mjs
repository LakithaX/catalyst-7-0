import React from 'react';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const server=await createServer({root,configFile:false,plugins:[(await import('@vitejs/plugin-react')).default()],resolve:{alias:{'@':root}},define:{'import.meta.env.VITE_SUPABASE_URL':'undefined','import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':'undefined'},server:{middlewareMode:true,hmr:false,ws:false,watch:null}});
try{
 const {default:AdminPage}=await server.ssrLoadModule('/src/pages/AdminPage.tsx');
 const html=renderToString(React.createElement(MemoryRouter,null,React.createElement(AdminPage)));
 assert.match(html,/Admin sign-in unavailable/);
 assert.doesNotMatch(html,/Delegate overview|admin-shell|Merchandise catalogue/);
 console.log('PASS: missing Supabase configuration does not render the admin dashboard.');
 const {default:AdminStatusChart}=await server.ssrLoadModule('/src/components/AdminStatusChart.tsx');
 const selected=[];
 const props={counts:{pending:3,approved:2},total:5,onSelect:status=>selected.push(status)};
 const chartHtml=renderToString(React.createElement(AdminStatusChart,props));
 assert.match(chartHtml,/3 pending registrations. View delegates./);
 assert.match(chartHtml,/0 rejected registrations. View delegates./);
 assert.equal((chartHtml.match(/role="button"/g)||[]).length,4);
 assert.equal((chartHtml.match(/tabindex="0"/g)||[]).length,4);
 const groups=AdminStatusChart(props).props.children[1];
 groups[0].props.onClick();
 let prevented=0;
 const key=key=>({key,preventDefault:()=>prevented++});
 groups[1].props.onKeyDown(key('Enter'));
 groups[2].props.onKeyDown(key(' '));
 groups[3].props.onKeyDown(key('ArrowRight'));
 assert.deepEqual(selected,['pending','approved','rejected']);
 assert.equal(prevented,2);
 const empty=renderToString(React.createElement(AdminStatusChart,{...props,counts:{},total:0}));
 assert.doesNotMatch(empty,/NaN|Infinity/);
 console.log('PASS: status chart labels, zero counts, pointer actions and keyboard actions.');
 const {OfficeToggle}=await server.ssrLoadModule('/src/components/AdminFrontOfficeChart.tsx');
 const modes=[];
 for(const kind of ['front','back']){
  const toggleProps={kind,onChange:value=>modes.push(value)};
  const toggleHtml=renderToString(React.createElement(OfficeToggle,toggleProps));
  assert.match(toggleHtml,new RegExp(`aria-pressed="true">${kind==='front'?'Front':'Back'} Office`));
  assert.equal((toggleHtml.match(/aria-pressed="true"/g)||[]).length,1);
  const buttons=OfficeToggle(toggleProps).props.children;
  buttons[kind==='front'?1:0].props.onClick();
 }
 assert.deepEqual(modes,['back','front']);
 console.log('PASS: front/back office toggle selection and accessible pressed state.');


}finally{await server.close();}
