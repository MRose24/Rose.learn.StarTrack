import React, { useState, useEffect } from 'react';
import { getBehaviors, getEmotions, downloadCSV } from '../services/storage';
import { STUDENTS, BehaviorRecord, EmotionRecord } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BrainCircuit, Star, Loader2, Award, Users, Download } from 'lucide-react';
import { generateStudentInsight } from '../services/geminiService';
import { EMOTIONS } from './MoodTracker';

type TimeRange = 'week' | 'month' | 'term' | 'year';

const Dashboard: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('week');
  const [behaviors, setBehaviors] = useState<Record<string, BehaviorRecord[]>>({});
  const [emotions, setEmotions] = useState<EmotionRecord[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedStudentForAI, setSelectedStudentForAI] = useState<string | null>(null);

  useEffect(() => {
    setBehaviors(getBehaviors());
    setEmotions(getEmotions());
  }, []);

  const filterDataByRange = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (range === 'week') return diffDays <= 7;
    if (range === 'month') return diffDays <= 30;
    if (range === 'term') return diffDays <= 120;
    if (range === 'year') return diffDays <= 365;
    return true;
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Student Name", "Category", "Type/Emotion", "Details/Note", "Score/Value"];
    const csvRows: (string | number)[][] = [];

    // Process Behaviors
    Object.values(behaviors).flat().filter(b => filterDataByRange(b.date)).forEach(b => {
      csvRows.push([b.date, b.studentName, "Behavior", b.type, b.details, b.starChange]);
    });

    // Process Emotions (Students Only)
    const studentNames = STUDENTS.map(s => s.name);
    emotions.filter(e => studentNames.includes(e.studentName) && filterDataByRange(e.date)).forEach(e => {
       csvRows.push([e.date, e.studentName, "Emotion", e.emotion, e.note, ""]);
    });
    
    // Sort by date desc
    csvRows.sort((a,b) => String(b[0]).localeCompare(String(a[0])));

    downloadCSV(`startrack_export_${range}_${new Date().toISOString().slice(0,10)}.csv`, headers, csvRows);
  };

  const handleAIAnalysis = async (studentName: string) => {
    setAiLoading(true);
    setSelectedStudentForAI(studentName);
    setAiInsight(null);
    
    const studentBehaviors = behaviors[studentName] || [];
    const emotionList = emotions
        .filter(e => e.studentName === studentName)
        .sort((a,b) => b.date.localeCompare(a.date));

    const result = await generateStudentInsight(studentName, studentBehaviors, emotionList.slice(0, 10));
    setAiInsight(result);
    setAiLoading(false);
  };

  const getBehaviorPieData = () => {
      let good = 0;
      let bad = 0;
      (Object.values(behaviors).flat() as BehaviorRecord[]).filter(b => filterDataByRange(b.date)).forEach(b => {
          if(b.type === 'good') good += Math.abs(b.starChange);
          if(b.type === 'bad') bad += Math.abs(b.starChange);
      });
      return [
          { name: 'เชิงบวก', value: good },
          { name: 'เชิงลบ', value: bad }
      ];
  };

  const getStudentEmotionPieData = () => {
      const counts: Record<string, number> = {};
      EMOTIONS.forEach(e => counts[e.label] = 0);
      const studentNames = STUDENTS.map(s => s.name);
      emotions.filter(e => studentNames.includes(e.studentName) && filterDataByRange(e.date)).forEach(e => {
          if(counts[e.emotion] !== undefined) counts[e.emotion]++;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const getTeacherEmotionPieData = () => {
      const counts: Record<string, number> = {};
      EMOTIONS.forEach(e => counts[e.label] = 0);
      const studentNames = STUDENTS.map(s => s.name);
      emotions.filter(e => !studentNames.includes(e.studentName) && filterDataByRange(e.date)).forEach(e => {
          if(counts[e.emotion] !== undefined) counts[e.emotion]++;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  // Matched Colors from Demo
  const PIE_COLORS_BEHAVIOR = ['#4ecea2', '#fb8daf'];
  const PIE_COLORS_EMOTION = ["#b1e5e0", "#a651b1", "#ffd7ef", "#ffe780", "#bfffa5", "#8dd6ee"];

  return (
    <section>
      <h2>🏫 ผู้บริหาร</h2>
      
      <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1em' }}>
            <h3 style={{ marginBottom: 0 }}><Award size={24} /> ภาพรวมโรงเรียน</h3>
            
            <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as TimeRange)}
                    style={{ width: 'auto', margin: 0 }}
                >
                    <option value="week">สัปดาห์นี้</option>
                    <option value="month">เดือนนี้</option>
                    <option value="term">ภาคเรียนนี้</option>
                    <option value="year">ปีนี้</option>
                </select>
                
                <button 
                    onClick={handleExportCSV} 
                    className="test-btn"
                    style={{ margin: 0, background: '#3c8c85', padding: '0.5em 1em' }}
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>
          </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2%' }}>
          <div className="box" style={{ flex: '1 1 30%', minWidth: '300px' }}>
             <h3><Star size={18} /> สถิติพฤติกรรม (รวม)</h3>
             <div className="piebox">
                 <div style={{ width: '100%', height: 200 }}>
                 <ResponsiveContainer>
                    <PieChart>
                        <Pie data={getBehaviorPieData()} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                            {getBehaviorPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS_BEHAVIOR[index % PIE_COLORS_BEHAVIOR.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                 </ResponsiveContainer>
                 </div>
             </div>
          </div>

          <div className="box" style={{ flex: '1 1 30%', minWidth: '300px' }}>
             <h3><Users size={18} /> สถิติอารมณ์นักเรียน</h3>
             <div className="piebox">
                 <div style={{ width: '100%', height: 200 }}>
                 <ResponsiveContainer>
                    <PieChart>
                        <Pie data={getStudentEmotionPieData()} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                            {getStudentEmotionPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS_EMOTION[index % PIE_COLORS_EMOTION.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                 </ResponsiveContainer>
                 </div>
             </div>
          </div>

          <div className="box" style={{ flex: '1 1 30%', minWidth: '300px' }}>
             <h3><BrainCircuit size={18} /> สถิติอารมณ์ครู</h3>
             <div className="piebox">
                 <div style={{ width: '100%', height: 200 }}>
                 <ResponsiveContainer>
                    <PieChart>
                        <Pie data={getTeacherEmotionPieData()} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                            {getTeacherEmotionPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS_EMOTION[index % PIE_COLORS_EMOTION.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                 </ResponsiveContainer>
                 </div>
             </div>
          </div>
      </div>

      <div className="box">
        <h3>รายละเอียดรายบุคคล</h3>
        {STUDENTS.map((student) => {
          const studentBehaviors = (behaviors[student.name] || []).filter(b => filterDataByRange(b.date));
          const totalStars = studentBehaviors.reduce((acc, curr) => acc + curr.starChange, 0);

          return (
            <div key={student.id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '1em', marginBottom: '1em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#86398e' }}>{student.name}</h4>
                  <div style={{ fontSize: '0.9em' }}>
                    คะแนนคงเหลือ: <span style={{ fontWeight: 'bold', color: totalStars >= 0 ? '#ffe780' : '#d04a6a', textShadow: '0 0 1px #888' }}>{totalStars} ⭐</span>
                  </div>
                </div>
                
                {selectedStudentForAI === student.name && aiInsight ? (
                    <div style={{ background: '#e9f5ff', padding: '1em', borderRadius: '10px', fontSize: '0.9em', maxWidth: '400px', position: 'relative' }}>
                        <button 
                            onClick={() => { setAiInsight(null); setSelectedStudentForAI(null); }}
                            style={{ position: 'absolute', top: 5, right: 5, border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}
                        >x</button>
                        <b>AI Analysis:</b>
                        <div style={{ whiteSpace: 'pre-line', marginTop: '5px' }}>{aiInsight}</div>
                    </div>
                ) : (
                    <button
                        onClick={() => handleAIAnalysis(student.name)}
                        className="test-btn"
                        style={{ fontSize: '0.8em', padding: '0.4em 1em' }}
                        disabled={aiLoading}
                    >
                        {aiLoading && selectedStudentForAI === student.name ? <Loader2 className="animate-spin" size={14} /> : <BrainCircuit size={14} />} วิเคราะห์ด้วย AI
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="box">
         <h3>ประวัติอารมณ์ล่าสุด (รวมทั้งหมด)</h3>
         <table className="stats-table">
                <thead>
                    <tr>
                        <th>วันที่</th>
                        <th>ชื่อ</th>
                        <th>อารมณ์</th>
                        <th>บันทึก</th>
                    </tr>
                </thead>
                <tbody>
                    {emotions
                     .filter(e => filterDataByRange(e.date))
                     .sort((a,b) => b.date.localeCompare(a.date))
                     .slice(0, 20)
                     .map((record, idx) => (
                        <tr key={idx}>
                            <td>{record.date}</td>
                            <td><b>{record.studentName}</b></td>
                            <td>{record.emoji} {record.emotion}</td>
                            <td>{record.note || '-'}</td>
                        </tr>
                     ))}
                </tbody>
            </table>
      </div>
    </section>
  );
};

export default Dashboard;