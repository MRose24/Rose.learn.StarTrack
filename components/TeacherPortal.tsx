import React, { useState, useEffect } from 'react';
import { EmotionRecord, Appointment, TeacherReport, STUDENTS } from '../types';
import MoodTracker, { EMOTIONS } from './MoodTracker';
import PsyTestSection from './PsyTestSection';
import BehaviorTracker from './BehaviorTracker';
import { getEmotions, getAppointments, saveAppointment, saveTeacherReport, getTeacherReports, getBehaviors, downloadCSV } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Calendar, Send, Inbox, MessageSquare, UserCheck, Download } from 'lucide-react';

const TeacherPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wellness' | 'management'>('wellness');
  const [teacherName, setTeacherName] = useState('ครู A');
  const [emotions, setEmotions] = useState<EmotionRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<TeacherReport[]>([]);
  
  const [appointDate, setAppointDate] = useState('');
  const [appointTopic, setAppointTopic] = useState('');

  // Management Tab State
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0].name);
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    if (activeTab === 'wellness') loadTeacherData();
    if (activeTab === 'management') loadReports();
  }, [teacherName, activeTab]);

  const loadTeacherData = () => {
    const allEmotions = getEmotions().filter(e => e.studentName === teacherName);
    setEmotions(allEmotions);
    setAppointments(getAppointments(teacherName));
  };

  const loadReports = () => {
    setReports(getTeacherReports().reverse());
  };

  const handleAppoint = () => {
    if (!appointDate) { alert("กรุณาเลือกวันเวลา"); return; }
    const appt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: teacherName,
      datetime: appointDate,
      topic: appointTopic,
      status: 'pending'
    };
    saveAppointment(appt);
    setAppointDate('');
    setAppointTopic('');
    loadTeacherData();
    alert("ส่งคำขอนัดหมายแล้ว");
  };

  const handleSendReport = () => {
    if(!reportContent.trim()) return;
    const report: TeacherReport = {
        id: Math.random().toString(36).substr(2, 9),
        studentName: selectedStudent,
        teacherName: teacherName,
        date: new Date().toLocaleString(),
        content: reportContent
    };
    saveTeacherReport(report);
    setReportContent('');
    loadReports();
    alert("ส่งรายงานถึงครูประจำชั้นแล้ว");
  };

  const handleExportStudentCSV = () => {
     const headers = ["Date", "Student Name", "Category", "Type/Emotion", "Details/Note", "Score/Value"];
     const csvRows: (string | number)[][] = [];
     
     // Behaviors
     const studentBehaviors = getBehaviors()[selectedStudent] || [];
     studentBehaviors.forEach(b => {
         csvRows.push([b.date, b.studentName, "Behavior", b.type, b.details, b.starChange]);
     });

     // Emotions
     const allEmotions = getEmotions();
     allEmotions.filter(e => e.studentName === selectedStudent).forEach(e => {
         csvRows.push([e.date, e.studentName, "Emotion", e.emotion, e.note, ""]);
     });
     
     csvRows.sort((a,b) => String(b[0]).localeCompare(String(a[0])));
     
     downloadCSV(`startrack_history_${selectedStudent}.csv`, headers, csvRows);
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

  return (
    <section>
      <h2>👩‍🏫 ครู</h2>
      <div className="box">
        <div style={{ display: 'flex', gap: '1em', alignItems: 'center', marginBottom: '1em' }}>
             <label>ชื่อครู:</label>
             <input 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)}
                style={{ marginBottom: 0 }}
             />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5em', justifyContent: 'center' }}>
            <button 
                onClick={() => setActiveTab('wellness')}
                className="rolebtn"
                style={{ fontSize: '0.9em', background: activeTab === 'wellness' ? '#e4e5ff' : '#fff' }}
            >
                สุขภาพใจครู
            </button>
            <button 
                onClick={() => setActiveTab('management')}
                className="rolebtn"
                style={{ fontSize: '0.9em', background: activeTab === 'management' ? '#e4e5ff' : '#fff' }}
            >
                ดูแลนักเรียน
            </button>
        </div>
      </div>

      {activeTab === 'management' ? (
          <div>
              <div className="box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3><UserCheck size={20} /> ดูแลนักเรียน & รายงานพฤติกรรม</h3>
                    <button 
                        onClick={handleExportStudentCSV}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3c8c85', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Download size={16} /> ประวัติ (CSV)
                    </button>
                </div>
                
                <label>เลือกนักเรียนที่ต้องการจัดการ:</label>
                <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    style={{ fontWeight: 'bold', color: '#86398e' }}
                >
                    {STUDENTS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>

                <div style={{ marginTop: '2em' }}>
                    <BehaviorTracker studentName={selectedStudent} />
                </div>

                <div style={{ marginTop: '2em', paddingTop: '1.5em', borderTop: '2px dashed #e6c6f5' }}>
                    <h3><MessageSquare size={20} /> รายงานถึงครูประจำชั้น</h3>
                    <div style={{ background: '#fff', padding: '1em', borderRadius: '10px', border: '1px solid #eee' }}>
                        <textarea 
                            placeholder={`พิมพ์รายงานเกี่ยวกับ ${selectedStudent}...`}
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            rows={3}
                            style={{ background: '#fdf8ff' }}
                        />
                        <button 
                            onClick={handleSendReport}
                            className="btn-main"
                        >
                            <Send size={18} /> ส่งรายงาน
                        </button>

                        <div style={{ marginTop: '1em' }}>
                            <small style={{ color: '#888', fontWeight: 'bold' }}>ประวัติรายงานที่ส่งแล้ว ({selectedStudent}):</small>
                            <div style={{ marginTop: '0.5em', maxHeight: '150px', overflowY: 'auto' }}>
                                {reports.filter(r => r.studentName === selectedStudent && r.teacherName === teacherName).map(r => (
                                    <div key={r.id} style={{ fontSize: '0.9em', padding: '0.5em', borderBottom: '1px solid #eee' }}>
                                        <span style={{ color: '#aaa', fontSize: '0.85em' }}>{r.date}:</span> {r.content}
                                    </div>
                                ))}
                                {reports.filter(r => r.studentName === selectedStudent && r.teacherName === teacherName).length === 0 && (
                                    <div style={{ color: '#ddd', fontSize: '0.9em', fontStyle: 'italic' }}>ยังไม่มีประวัติการส่งรายงาน</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="box">
                <h3><Inbox size={20} /> กล่องข้อความรับเรื่อง (Inbox)</h3>
                <div style={{ background: '#f1ffea', padding: '1em', borderRadius: '10px', height: '300px', overflowY: 'auto' }}>
                    {reports.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#aaa', paddingTop: '2em' }}>ไม่มีรายการรายงาน</div>
                    ) : (
                        reports.map(r => (
                            <div key={r.id} className="diary-entry">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5em' }}>
                                    <strong style={{ color: '#86398e' }}>{r.studentName}</strong>
                                    <span style={{ fontSize: '0.8em', color: '#888' }}>{r.date}</span>
                                </div>
                                <p>{r.content}</p>
                                <div style={{ textAlign: 'right', fontSize: '0.8em', color: '#888' }}>โดย: {r.teacherName}</div>
                            </div>
                        ))
                    )}
                </div>
              </div>
          </div>
      ) : (
          <div>
             <div className="box">
                <MoodTracker userName={teacherName} onSave={loadTeacherData} />
                
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
                <PsyTestSection userName={teacherName} />
             </div>
             
             <div className="box">
                <h3><Calendar size={20} color="#5b9bd5" /> นัดหมายนักจิตวิทยา</h3>
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
          </div>
      )}
    </section>
  );
};

export default TeacherPortal;