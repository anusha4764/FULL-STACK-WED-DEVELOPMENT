import { useState } from 'react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'CSD', 'Other'];

const INITIAL = {
  studentId: '', fullName: '', email: '', department: 'CSE',
  yearOfStudy: 1, phoneNumber: '', cgpa: '', activeBacklogs: 0, specialization: ''
};

export default function StudentForm({ student, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(student ? {
    studentId: student.studentId,
    fullName: student.fullName,
    email: student.email,
    department: student.department,
    yearOfStudy: student.yearOfStudy,
    phoneNumber: student.phoneNumber,
    cgpa: student.cgpa,
    activeBacklogs: student.activeBacklogs,
    specialization: student.specialization || '',
  } : INITIAL);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.studentId.trim()) e.studentId = 'Required';
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Required';
    else if (!/^[0-9]{10}$/.test(form.phoneNumber)) e.phoneNumber = '10 digits only';
    if (form.cgpa === '' || form.cgpa === null) e.cgpa = 'Required';
    else if (Number(form.cgpa) < 0 || Number(form.cgpa) > 10) e.cgpa = '0–10 range';
    if (Number(form.activeBacklogs) < 0) e.activeBacklogs = 'Cannot be negative';
    return e;
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await onSubmit({
        ...form,
        yearOfStudy: Number(form.yearOfStudy),
        cgpa: Number(form.cgpa),
        activeBacklogs: Number(form.activeBacklogs),
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Something went wrong');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            {submitError && <div className="form-error">{submitError}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label>Student ID *</label>
                <input name="studentId" value={form.studentId} onChange={change} placeholder="e.g. CSE2024001" disabled={!!student} />
                {errors.studentId && <span className="field-error">{errors.studentId}</span>}
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={change} placeholder="Enter full name" />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="form-group full">
                <label>Email *</label>
                <input name="email" type="email" value={form.email} onChange={change} placeholder="student@university.edu" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select name="department" value={form.department} onChange={change}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Year of Study *</label>
                <select name="yearOfStudy" value={form.yearOfStudy} onChange={change}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={change} placeholder="10-digit number" maxLength={10} />
                {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
              </div>
              <div className="form-group">
                <label>CGPA (0–10) *</label>
                <input name="cgpa" type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={change} placeholder="e.g. 8.5" />
                {errors.cgpa && <span className="field-error">{errors.cgpa}</span>}
              </div>
              <div className="form-group">
                <label>Active Backlogs</label>
                <input name="activeBacklogs" type="number" min="0" value={form.activeBacklogs} onChange={change} />
                {errors.activeBacklogs && <span className="field-error">{errors.activeBacklogs}</span>}
              </div>
              <div className="form-group full">
                <label>Specialization</label>
                <input name="specialization" value={form.specialization} onChange={change} placeholder="e.g. Machine Learning, VLSI" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
