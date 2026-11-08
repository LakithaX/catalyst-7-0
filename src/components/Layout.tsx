import React from 'react';
import { Outlet } from 'react-router-dom';
import OutroFooter from './ui/outro-footer';

export default function Layout() {
  return (
    <>
      <Outlet />
      <OutroFooter active />
    </>
  );
}
