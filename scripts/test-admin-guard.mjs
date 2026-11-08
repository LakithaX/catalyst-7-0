import React from 'react';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const server=await createServer({root,configFile:false,plugins:[(await import('@vitejs/plugin-react')).default()],resolve:{alias:{'@':root}},define:{'import.meta.env.VITE_SUPABASE_URL':'undefined','import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY':'undefined'},server:{middlewareMode:true,hmr:false,watch:null}});
try{
 const {default:AdminPage}=await server.ssrLoadModule('/src/pages/AdminPage.tsx');
 const html=renderToString(React.createElement(MemoryRouter,null,React.createElement(AdminPage)));
 assert.match(html,/Admin sign-in unavailable/);
 assert.doesNotMatch(html,/Delegate overview|admin-shell|Merchandise catalogue/);
 console.log('PASS: missing Supabase configuration does not render the admin dashboard.');
}finally{await server.close();}
