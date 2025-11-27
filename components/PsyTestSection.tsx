import React, { useState, useEffect } from 'react';
import { BrainCircuit } from 'lucide-react';
import { savePsyTest, getPsyTests } from '../services/storage';
import { PsyTestRecord } from '../types';

interface PsyTestSectionProps {
  userName: string;
}

const TESTS = {
  stress: { 
    title: "แบบประเมินความเครียด", 
    questions: [
      "นอนไม่ค่อยหลับ", 
      "มีสมาธิสั้น/ตื่นตระหนกง่าย", 
      "รู้สึกหงุดหงิดง่าย",
      "รู้สึกวิตกกังวลสิ่งต่างๆ",
      "เหนื่อยล้า/หมดแรง"
    ], 
    scoring: ["ไม่เลย (0)", "น้อย (1)", "ปานกลาง (2)", "บ่อย (3)", "มากที่สุด (4)"],
    interpret: [0, 6, 11, 16] 
  },
  depress: { 
    title: "แบบประเมินความซึมเศร้า", 
    questions: [
      "รู้สึกเศร้าเป็นส่วนใหญ่ของวัน", 
      "ไม่มีความสุขกับสิ่งที่เคยชอบ", 
      "รู้สึกไร้ค่า",
      "เหนื่อยง่าย/หมดแรง",
      "สมาธิลดลง/ลังเลใจ"
    ], 
    scoring: ["ไม่เลย (0)", "น้อย (1)", "ปานกลาง (2)", "บ่อย (3)", "มากที่สุด (4)"],
    interpret: [0, 6, 11, 16] 
  }
};

const PsyTestSection: React.FC<PsyTestSectionProps> = ({ userName }) => {
  const [testType, setTestType] = useState<'stress' | 'depress'>('stress');
  const [showTest, setShowTest] = useState(false);
  const [result, setResult] = useState<PsyTestRecord | null>(null);
  const [history, setHistory] = useState<PsyTestRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, [userName]);

  const loadHistory = () => {
    setHistory(getPsyTests(userName));
  };

  const handleTestSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let score = 0;
    for (const value of formData.values()) {
        score += parseInt(value as string);
    }

    const t = TESTS[testType];
    let level = 0;
    for(let i=0; i < t.interpret.length; i++){
        if(score >= t.interpret[i]) level = i;
    }
    
    let resultMsg = "";
    if(testType === "stress") {
        resultMsg = ["ความเครียดระดับต่ำ-ปกติ","เริ่มมีความเครียด","เครียดระดับปานกลาง","เสี่ยงสูงควรขอคำปรึกษา"][level] || "เสี่ยงสูง";
    } else {
        resultMsg = ["ไม่มีอาการซึมเศร้า","ซึมเศร้าเล็กน้อย","ซึมเศร้าปานกลาง","ซึมเศร้ารุนแรง"][level] || "เสี่ยงสูง";
    }

    const record: PsyTestRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userName,
      date: new Date().toLocaleString(),
      testType: t.title,
      score,
      result: resultMsg
    };

    savePsyTest(record);
    setResult(record);
    setShowTest(false);
    loadHistory();
  };

  return (
    <div>
      <h3><BrainCircuit size={20} color="#6ec4b0" /> แบบทดสอบจิตวิทยา</h3>
      
      {!result && !showTest && (
        <div style={{ display: 'flex', gap: '1em', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={testType}
            onChange={(e) => setTestType(e.target.value as any)}
            style={{ marginBottom: 0 }}
          >
            <option value="stress">แบบประเมินความเครียด</option>
            <option value="depress">แบบประเมินความซึมเศร้า</option>
          </select>
          <button 
            onClick={() => setShowTest(true)}
            className="test-btn"
            style={{ margin: 0, whiteSpace: 'nowrap' }}
          >
            ทำแบบทดสอบ
          </button>
        </div>
      )}

      {showTest && (
        <form onSubmit={handleTestSubmit} style={{ background: 'var(--pastel-light-blue)', padding: '1.5em', borderRadius: '10px' }}>
          <h4 style={{ marginTop: 0, color: '#813a75' }}>{TESTS[testType].title}</h4>
          {TESTS[testType].questions.map((q, i) => (
            <div key={i} style={{ marginBottom: '1em' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5em' }}>{i+1}. {q}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em' }}>
                {TESTS[testType].scoring.map((label, val) => (
                   <label key={val} style={{ fontSize: '0.9em', cursor: 'pointer' }}>
                     <input type="radio" name={`q${i}`} value={val} required /> 
                     {label}
                   </label>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
             <button type="button" onClick={() => setShowTest(false)} className="btn-main" style={{ background: '#ddd', color: '#555' }}>ยกเลิก</button>
             <button type="submit" className="btn-main">ส่งคำตอบ</button>
          </div>
        </form>
      )}

      {result && (
        <div className="test-res">
          <div style={{ fontWeight: 'bold' }}>ผลการประเมินล่าสุด:</div>
          <div style={{ fontSize: '1.5em', margin: '0.5em 0' }}>{result.score} คะแนน</div>
          <div>{result.result}</div>
          <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', textDecoration: 'underline', color: '#3c8c85', marginTop: '1em', cursor: 'pointer' }}>ปิด</button>
        </div>
      )}

      <div style={{ marginTop: '1.5em', borderTop: '1px solid #ddd', paddingTop: '1em' }}>
         <h4 style={{ margin: '0 0 1em 0', color: '#aaa', fontSize: '0.9em' }}>ประวัติการทำแบบทดสอบ</h4>
         <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {history.map(h => (
              <div key={h.id} className="diary-entry">
                 <div style={{ display: 'flex', justifySelf: 'space-between', fontWeight: 'bold', color: '#5e548e' }}>
                    <span style={{ flex: 1 }}>{h.testType}</span>
                    <span style={{ color: '#813a75' }}>{h.score} คะแนน</span>
                 </div>
                 <div style={{ display: 'flex', justifySelf: 'space-between', fontSize: '0.9em', color: '#888' }}>
                    <span style={{ flex: 1 }}>{h.date}</span>
                    <span>{h.result}</span>
                 </div>
              </div>
            ))}
            {history.length === 0 && <div style={{ color: '#aaa' }}>ยังไม่มีประวัติ</div>}
         </div>
      </div>
    </div>
  );
};

export default PsyTestSection;