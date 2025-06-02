
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import styles from './AdminLayout.module.css'; 

function AdminLayout({ onLogout }) {
  return (
    <div className={styles.adminLayout}> 
      <Sidebar onLogout={onLogout} />
      <main className={styles.adminContent}> 
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;