import React, { useState, useEffect } from 'react';
import { STUDENTS, EmotionRecord, DiaryEntry, Appointment, BehaviorRecord } from '../types';
import MoodTracker, { EMOTIONS } from './MoodTracker';
import PsyTestSection from './PsyTestSection';
import { getEmotions, getDiary, saveDiary, deleteDiary, saveAppointment, getAppointments, getBehaviors, saveBehavior, getTodayDate } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Book, Trash2, Calendar, Star, Gift, Clock } from 'lucide-react';

const StudentPortal: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0].name);
  const [emotions, setEmotions] = useState<EmotionRecord[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [starBalance, setStarBalance] = useState(0);
  const [starHistory, setStarHistory] = useState<BehaviorRecord[]>([]);
  
  const [newDiary, setNewDiary] = useState('');
  const [appointDate, setAppointDate] = useState('');
  const [appointTopic, setAppointTopic] = useState('');

  useEffect(() => {
    loadStudentData();
  }, [selectedStudent]);

  const loadStudentData = () => {
    const allEmotions = getEmotions().filter(e => e.studentName === selectedStudent);
    setEmotions(allEmotions);
    setDiaryEntries(getDiary(selectedStudent));
    setAppointments(getAppointments(selectedStudent));
    
    const allBehaviors = getBehaviors()[selectedStudent] || [];
    setStarHistory(allBehaviors);
    const balance = allBehaviors.reduce((acc, curr) => acc + curr.starChange, 0);
    setStarBalance(balance);
  };

  const getPieData = () => {
    const counts: Record<string, number> = {};
    EMOTIONS.forEach(e => counts[e.label] = 0);
    emotions.forEach(e => {
      if (counts[e.emotion] !== undefined) counts[e.emotion]++;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };
  
  const PIE_COLORS = ["#b1e5e0", "#a651b1", "#ffd7ef", "#ffe780", "#bfffa5", "#8dd6ee"];

  const handleSaveDiary = () => {
    if (!newDiary.trim()) return;
    const entry: DiaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: selectedStudent,
      date: new Date().toLocaleString(),
      content: newDiary
    };
    saveDiary(entry);
    setNewDiary('');
    loadStudentData();
  };

  const handleDeleteDiary = (id: string) => {
    if (window.confirm("ลบบันทึกนี้?")) {
      deleteDiary(id);
      loadStudentData();
    }
  };

  const handleAppoint = () => {
    if (!appointDate) { alert("กรุณาเลือกวันเวลา"); return; }
    const appt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: selectedStudent,
      datetime: appointDate,
      topic: appointTopic,
      status: 'pending'
    };
    saveAppointment(appt);
    setAppointDate('');
    setAppointTopic('');
    loadStudentData();
    alert("ส่งคำขอนัดหมายแล้ว");
  };

  const handleRedeem = (item: string, cost: number) => {
    if (starBalance < cost) {
      alert("ดาวสะสมไม่เพียงพอ");
      return;
    }
    if (window.confirm(`ต้องการแลก "${item}" ด้วย ${cost} ดาวหรือไม่?`)) {
      const record: BehaviorRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentName: selectedStudent,
        date: getTodayDate(),
        type: 'redeem',
        details: `แลกของรางวัล: ${item}`,
        starChange: -cost
      };
      saveBehavior(selectedStudent, record);
      loadStudentData();
      alert("แลกรางวัลสำเร็จ!");
    }
  };

  return (
    <section>
      <h2>👦 นักเรียน</h2>
      
      {/* Student Selector */}
      <div className="box">
        <label>เลือกชื่อฉัน:</label>
        <select 
          value={selectedStudent} 
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          {STUDENTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      <div className="box">
        <MoodTracker userName={selectedStudent} onSave={loadStudentData} />
        
        <div className="piebox">
           <label>Pie Chart อารมณ์ของคุณ</label>
           <div style={{ width: '100%', height: 270 }}>
             {emotions.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
             ) : (
                 <div style={{ paddingTop: '100px', color: '#aaa' }}>ยังไม่มีข้อมูลอารมณ์</div>
             )}
           </div>
        </div>
      </div>

      <div className="box">
         <h3><Book size={20} /> My Diary</h3>
         <label>จดบันทึกประจำวัน</label>
         <textarea 
           placeholder="เขียนบันทึกประจำวัน..."
           rows={3}
           value={newDiary}
           onChange={(e) => setNewDiary(e.target.value)}
         />
         <button onClick={handleSaveDiary} className="btn-main">
            บันทึก Diary
         </button>
         
         <div className="diary-list">
            {diaryEntries.map(entry => (
              <div key={entry.id} className="diary-entry">
                 <span className="diary-date">{entry.date}</span>
                 {entry.content}
                 <button 
                   onClick={() => handleDeleteDiary(entry.id)}
                   className="diary-del-btn"
                 >
                   <Trash2 size={14} /> ลบ
                 </button>
              </div>
            ))}
            {diaryEntries.length === 0 && <div style={{ textAlign: 'center', color: '#aaa' }}>ยังไม่มีบันทึก</div>}
         </div>
      </div>

      <div className="box">
        <h3><Star size={20} className="text-yellow-400" /> ดาวเด็กดี & แลกกิจกรรม</h3>
        <div style={{ fontSize: '1.2em', margin: '1em 0' }}>
           <b>⭐ ดาวสะสม:</b> <span className="star">{'⭐️'.repeat(Math.max(0, starBalance))}</span> ({starBalance} ดาว)
        </div>
        
        <h4>แลกดาวสะสมกับ:</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
           {[
             { name: "ขอเวลาพัก 5 นาที", cost: 15, icon: Clock },
             { name: "คูปองเครื่องเขียน", cost: 10, icon: Gift },
             { name: "คูปองน้ำดื่ม", cost: 12, icon: Gift }
           ].map((item, i) => (
             <li key={i} style={{ background: '#e6f6ff', margin: '0.5em 0', padding: '0.5em', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <item.icon size={16} color="#ffa500" /> {item.name} ({item.cost} ดาว)
                </span>
                <button 
                  onClick={() => handleRedeem(item.name, item.cost)}
                  disabled={starBalance < item.cost}
                  className="btn-main"
                  style={{ margin: 0, padding: '0.3em 1em', fontSize: '0.9em', opacity: starBalance < item.cost ? 0.5 : 1 }}
                >
                  แลก
                </button>
             </li>
           ))}
        </ul>

        <h4>ประวัติการแลก/ได้รับ</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="stats-table">
                <thead>
                    <tr>
                        <th>รายละเอียด</th>
                        <th>จำนวน</th>
                    </tr>
                </thead>
                <tbody>
                {starHistory.slice().reverse().map(h => (
                    <tr key={h.id}>
                        <td>{h.details}</td>
                        <td className={h.starChange > 0 ? "good" : "bad"}>
                            {h.starChange > 0 ? '+' : ''}{h.starChange}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="box">
          <PsyTestSection userName={selectedStudent} />
      </div>

      <div className="box">
         <h3><Calendar size={20} color="#5b9bd5" /> นัดหมายครูแนะแนว</h3>
         <label>วัน-เวลา</label>
         <input 
           type="datetime-local" 
           value={appointDate}
           onChange={(e) => setAppointDate(e.target.value)}
         />
         <label>หัวข้อ/ปัญหาที่ต้องการพูดคุย</label>
         <input 
           type="text" 
           placeholder="หัวข้อ..."
           value={appointTopic}
           onChange={(e) => setAppointTopic(e.target.value)}
         />
         <button onClick={handleAppoint} className="appoint-btn">
           นัดหมาย
         </button>
         
         <div className="diary-list">
           {appointments.map(a => (
             <div key={a.id} className="diary-entry">
               <span className="diary-date">{new Date(a.datetime).toLocaleString()}</span>
               {a.topic || "ไม่ระบุหัวข้อ"} <span style={{ float: 'right', background: '#fff4a7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em' }}>{a.status}</span>
             </div>
           ))}
         </div>
      </div>
    </section>
  );
};

export default StudentPortal;