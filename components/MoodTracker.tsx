import React, { useState } from 'react';
import { EmotionRecord, EmotionType } from '../types';
import { saveEmotion, getTodayDate } from '../services/storage';

export const EMOTIONS: { label: EmotionType; emoji: string; }[] = [
  { label: 'ดีมาก', emoji: '😁' },
  { label: 'ดี', emoji: '😊' },
  { label: 'ปกติ', emoji: '😐' },
  { label: 'เศร้า', emoji: '😢' },
  { label: 'เครียด', emoji: '😣' },
  { label: 'โกรธ', emoji: '😡' },
];

interface MoodTrackerProps {
  userName: string;
  onSave?: () => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ userName, onSave }) => {
  const [selected, setSelected] = useState<{ label: EmotionType; emoji: string } | null>(null);
  const [note, setNote] = useState('');

  const handleSave = () => {
    if (!selected) {
        alert("กรุณาเลือกอารมณ์ก่อน");
        return;
    }
    const record: EmotionRecord = {
      id: Math.random().toString(36).substring(7),
      studentName: userName,
      date: getTodayDate(),
      timestamp: new Date().toISOString(),
      emotion: selected.label,
      emoji: selected.emoji,
      note: note.trim(),
    };
    saveEmotion(record);
    alert('บันทึกอารมณ์สำเร็จ!');
    setSelected(null);
    setNote('');
    if (onSave) onSave();
  };

  return (
    <div>
      <h3>1. บันทึกอารมณ์</h3>
      <div className="emotion-btns">
          {EMOTIONS.map((emo) => (
            <button
                key={emo.label}
                onClick={() => setSelected(emo)}
                className={selected?.label === emo.label ? 'selected' : ''}
            >
                {emo.emoji}
            </button>
          ))}
      </div>
      {selected && (
          <div style={{ textAlign: 'center', margin: '0.5em 0', fontSize: '1.1em', color: '#8C448F' }}>
              เลือก: {selected.emoji} ({selected.label})
          </div>
      )}
      
      <label>บันทึกโน้ต/สาเหตุ</label>
      <textarea
        rows={2}
        placeholder="บันทึกเพิ่มเติม..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button onClick={handleSave} className="btn-main">
        บันทึกอารมณ์
      </button>
    </div>
  );
};

export default MoodTracker;