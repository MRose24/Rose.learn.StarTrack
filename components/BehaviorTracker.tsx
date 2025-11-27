import React, { useState, useEffect } from 'react';
import { BehaviorType, BehaviorRecord } from '../types';
import { saveBehavior, getTodayDate, getBehaviors } from '../services/storage';
import { UserCheck, Star, AlertTriangle, CheckCircle2, Save, History } from 'lucide-react';

interface BehaviorTrackerProps {
  studentName: string;
}

const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({ studentName }) => {
  const [type, setType] = useState<BehaviorType>('good');
  const [detail, setDetail] = useState('');
  const [stars, setStars] = useState(1);
  const [history, setHistory] = useState<BehaviorRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, [studentName]);

  const loadHistory = () => {
    const all = getBehaviors()[studentName] || [];
    setHistory(all);
  };

  const handleSave = () => {
    if (!detail.trim()) {
      alert('กรุณากรอกรายละเอียดพฤติกรรม');
      return;
    }

    const starChange = type === 'good' ? stars : -stars;
    const record: BehaviorRecord = {
      id: Math.random().toString(36).substring(7),
      studentName: studentName,
      date: getTodayDate(),
      type,
      details: detail.trim(),
      starChange,
    };

    saveBehavior(studentName, record);
    alert('บันทึกพฤติกรรมสำเร็จ!');
    setDetail('');
    setStars(1);
    loadHistory();
  };

  const totalStars = history.reduce((acc, curr) => acc + curr.starChange, 0);

  return (
    <div>
      <div style={{ marginBottom: '1em', fontSize: '1.1em' }}>
        <b>⭐ ดาวสะสม:</b> <span className="star">{'⭐️'.repeat(Math.max(0, totalStars))}</span> ({totalStars} ดาว)
      </div>

      <div>
          <label>เลือกประเภทพฤติกรรม</label>
          <div style={{ display: 'flex', gap: '1em' }}>
             <button
                onClick={() => setType('good')}
                className="btn-main"
                style={{ 
                    background: type === 'good' ? '#d9fff5' : '#e6f6ff',
                    color: type === 'good' ? '#3c8c85' : '#888',
                    flex: 1,
                    marginTop: 0
                }}
             >
                 <CheckCircle2 size={18} /> เชิงบวก
             </button>
             <button
                onClick={() => setType('bad')}
                className="btn-main"
                style={{ 
                    background: type === 'bad' ? '#ffd7ef' : '#e6f6ff',
                    color: type === 'bad' ? '#d13d84' : '#888',
                    flex: 1,
                    marginTop: 0
                }}
             >
                 <AlertTriangle size={18} /> เชิงลบ
             </button>
          </div>
      </div>

      <div style={{ marginTop: '1em', padding: '1em', background: type === 'good' ? '#d9fff5' : '#fff0f5', borderRadius: '10px' }}>
          <label>รายละเอียด ({type === 'good' ? 'เช่น ช่วยเหลือเพื่อน' : 'เช่น ทะเลาะวิวาท'})</label>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ background: 'white' }}
          />

          <label>{type === 'good' ? 'เพิ่มดาวเด็กดี (⭐)' : 'หักดาวเด็กดี (-⭐)'}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
             <input
                type="number"
                min="1"
                max="10"
                value={stars}
                onChange={(e) => setStars(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '80px', background: 'white', fontWeight: 'bold' }}
             />
             <div style={{ color: '#ffd700', display: 'flex' }}>
                  {[...Array(Math.min(5, stars))].map((_, i) => (
                    <Star key={i} fill="currentColor" size={24} />
                  ))}
             </div>
          </div>
      </div>

      <button onClick={handleSave} className="btn-main" style={{ width: '100%', marginTop: '1.5em' }}>
          <Save size={18} /> บันทึกพฤติกรรมวันนี้
      </button>

      <div style={{ marginTop: '2em' }}>
        <h4><History size={16} style={{ verticalAlign: 'middle' }}/> ประวัติพฤติกรรม ({studentName})</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="stats-table">
                <thead>
                    <tr>
                        <th>วันที่</th>
                        <th>รายละเอียด</th>
                        <th>ประเภท</th>
                        <th>จำนวน</th>
                    </tr>
                </thead>
                <tbody>
                    {history.slice().reverse().map((h) => (
                        <tr key={h.id}>
                            <td>{h.date}</td>
                            <td>{h.details}</td>
                            <td className={h.type === 'good' ? 'good' : h.type === 'bad' ? 'bad' : ''}>
                                {h.type === 'good' ? 'เพิ่ม' : h.type === 'bad' ? 'ลด' : 'แลก'}
                            </td>
                            <td>
                                {h.type === 'good' ? '+' : h.type === 'bad' ? '-' : ''}{Math.abs(h.starChange)} ⭐
                            </td>
                        </tr>
                    ))}
                    {history.length === 0 && <tr><td colSpan={4} style={{textAlign:'center'}}>ไม่มีข้อมูล</td></tr>}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTracker;