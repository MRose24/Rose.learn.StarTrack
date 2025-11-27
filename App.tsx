import React, { useState } from 'react';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import Dashboard from './components/Dashboard';
import { LogOut } from 'lucide-react';

type Role = 'student' | 'teacher' | 'admin';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>('student');

  return (
    <div>
      <header>
        <h1>StarTrack DEMO</h1>
        <div style={{ color: '#a14f88', fontWeight: 500 }}>ระบบติดตามอารมณ์และดาวเด็กดี</div>
      </header>

      <nav>
        <button 
          className={`rolebtn ${currentRole === 'student' ? 'active' : ''}`}
          onClick={() => setCurrentRole('student')}
        >
          👦 นักเรียน
        </button>
        <button 
          className={`rolebtn ${currentRole === 'teacher' ? 'active' : ''}`}
          onClick={() => setCurrentRole('teacher')}
        >
          👩‍🏫 ครู
        </button>
        <button 
          className={`rolebtn ${currentRole === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentRole('admin')}
        >
          🏫 ผู้บริหาร
        </button>
        <button 
          className="btn-main" 
          style={{ float: 'right', margin: '0.4em', padding: '0.5em 1em', fontSize: '0.9em', backgroundColor: '#e67c96', color: 'white' }}
          onClick={() => window.location.reload()}
        >
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </nav>

      <main>
        {currentRole === 'student' && <StudentPortal />}
        {currentRole === 'teacher' && <TeacherPortal />}
        {currentRole === 'admin' && <Dashboard />}
      </main>
    </div>
  );
};

export default App;