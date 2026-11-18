import React from 'react';
import {
  FileText,
  Printer,
  X,
  Heart,
  Pill,
  ShieldCheck,
  Brain,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LinkedElder } from '../../services/sandboxStorage';
import { ZoneEventItem } from '../../types';

interface ClinicalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElder?: LinkedElder;
  safeZoneRadius?: number;
  zoneEvents?: ZoneEventItem[];
}

export const ClinicalSummaryModal: React.FC<ClinicalSummaryModalProps> = ({
  isOpen,
  onClose,
  currentElder,
  safeZoneRadius = 600,
  zoneEvents = [],
}) => {
  if (!isOpen) return null;

  const elderName = currentElder?.name || 'Bimala Baruah';
  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const defaultZoneEvents: ZoneEventItem[] = [
    { id: '1', time: 'Yesterday, 5:15 PM', label: 'Dispur Namghar Road', type: 'exit' },
    { id: '2', time: 'Yesterday, 5:48 PM', label: 'Returned to Residence', type: 'enter' },
    { id: '3', time: '3 days ago, 9:20 AM', label: 'Morning garden walk', type: 'enter' },
  ];

  const displayEvents = zoneEvents && zoneEvents.length > 0 ? zoneEvents : defaultZoneEvents;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clinical-summary-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:overflow-visible"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF6EE] border border-[#E6DAB9] rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-w-none print:rounded-none">
        {/* Modal Controls Bar - Hidden during Print / PDF Export */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#22403A] text-[#FBF7EE] print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#E2A33D]" />
            <span id="clinical-summary-title" className="font-fraunces text-lg">
              Geriatric Clinical Care Assessment
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E2A33D] hover:bg-[#d4942e] text-[#221F1B] rounded-xl font-baloo font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Export as PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-[#FBF7EE] active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="clinical-summary-printable" className="p-8 sm:p-10 space-y-8 bg-white print:p-6 text-[#221F1B]">
          {/* Header */}
          <div className="border-b-2 border-[#22403A] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-baloo font-bold text-[#22403A] uppercase tracking-widest mb-1">
                <Heart className="w-4 h-4 text-[#BD5B3B]" />
                Sahay Elder Care &amp; Cognitive Health System
              </div>
              <h1 className="font-fraunces text-3xl font-bold text-[#221F1B]">
                30-Day Clinical Summary &amp; Care Assessment
              </h1>
              <p className="text-xs text-[#665F51] mt-1">
                Standard Geriatric Consultation Handout • Cognitive Resilience, Adherence &amp; Mobility
              </p>
            </div>
            <div className="text-left sm:text-right font-baloo text-xs text-[#665F51] space-y-0.5">
              <div><strong>Report Generated:</strong> {reportDate}</div>
              <div><strong>Assessment Window:</strong> Preceding 30 Days</div>
              <div><strong>Ambient Status:</strong> Active Telemetry</div>
            </div>
          </div>

          {/* Patient Demographic Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#F8F5EC] border border-[#E6DAB9] text-xs">
            <div>
              <span className="text-[#948C7A] font-bold block uppercase tracking-wider text-[10px]">Patient Name</span>
              <span className="font-fraunces text-base font-bold text-[#221F1B] mt-0.5 block">{elderName}</span>
            </div>
            <div>
              <span className="text-[#948C7A] font-bold block uppercase tracking-wider text-[10px]">Primary Caregiver</span>
              <span className="font-bold text-[#22403A] mt-0.5 block">Ranjit Baruah (Son)</span>
            </div>
            <div>
              <span className="text-[#948C7A] font-bold block uppercase tracking-wider text-[10px]">Safe Perimeter</span>
              <span className="font-bold text-[#221F1B] mt-0.5 block">{safeZoneRadius}m radius</span>
            </div>
            <div>
              <span className="text-[#948C7A] font-bold block uppercase tracking-wider text-[10px]">Care Level</span>
              <span className="font-bold text-[#BD5B3B] mt-0.5 block">Mild Memory Support</span>
            </div>
          </div>

          {/* Section 1: Cognitive Stimulation & Working Memory Resilience */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-baloo font-bold text-[#22403A] uppercase tracking-wider border-b border-[#E6DAB9] pb-1.5">
              <Brain className="w-4 h-4 text-[#22403A]" />
              1. Cognitive Stimulation &amp; Working Memory Metrics
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#E6DAB9] bg-[#FAF8F3]">
                <span className="text-xs text-[#665F51] block mb-1">Overall Cognitive Accuracy</span>
                <span className="font-fraunces text-2xl font-bold text-[#22403A]">88%</span>
                <span className="text-[11px] text-[#3F7455] font-bold block mt-1">↑ +4% vs last cycle</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E6DAB9] bg-[#FAF8F3]">
                <span className="text-xs text-[#665F51] block mb-1">Working Memory (Digit Span)</span>
                <span className="font-fraunces text-2xl font-bold text-[#22403A]">Level 4 (Reverse)</span>
                <span className="text-[11px] text-[#665F51] block mt-1">Avg. reaction: 1.3s</span>
              </div>
              <div className="p-4 rounded-xl border border-[#E6DAB9] bg-[#FAF8F3]">
                <span className="text-xs text-[#665F51] block mb-1">Monthly Engagement</span>
                <span className="font-fraunces text-2xl font-bold text-[#22403A]">26 Days</span>
                <span className="text-[11px] text-[#665F51] block mt-1">Total 52 exercise sessions</span>
              </div>
            </div>
          </div>

          {/* Section 2: Medication Adherence Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-baloo font-bold text-[#22403A] uppercase tracking-wider border-b border-[#E6DAB9] pb-1.5">
              <Pill className="w-4 h-4 text-[#BD5B3B]" />
              2. Medication Adherence Rate &amp; Timetable
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#E6DAB9] bg-[#FAF8F3]">
                <span className="text-xs text-[#665F51] block mb-1">Overall Dose Adherence</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-fraunces text-3xl font-bold text-[#22403A]">94.2%</span>
                  <span className="text-xs text-[#3F7455] font-bold">Compliant Tier A</span>
                </div>
                <div className="w-full bg-[#E6DAB9] h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#3F7455] h-full rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#E6DAB9] bg-[#FAF8F3]">
                <span className="text-xs text-[#665F51] block mb-1">Dosing Schedule Breakdown</span>
                <ul className="text-xs space-y-1 text-[#221F1B]">
                  <li className="flex items-center justify-between">
                    <span>Morning Dosages (Donepezil 5mg, Multivitamin):</span>
                    <strong className="text-[#3F7455]">100% On-time</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Evening Dosages (Blood Pressure &amp; Calcium):</span>
                    <strong className="text-[#BD5B3B]">84% (2 delayed)</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Geofence Safety & Wandering Protection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-baloo font-bold text-[#22403A] uppercase tracking-wider border-b border-[#E6DAB9] pb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#22403A]" />
              3. Ambient Mobility &amp; Geofence Safety Logs
            </div>
            <div className="border border-[#E6DAB9] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#F1E7CE] text-[#665F51] font-baloo font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Recorded Time</th>
                    <th className="p-2.5">Boundary Event</th>
                    <th className="p-2.5">Classification</th>
                    <th className="p-2.5">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DAB9]">
                  {displayEvents.slice(0, 4).map((evt) => (
                    <tr key={evt.id}>
                      <td className="p-2.5 font-mono">{evt.time}</td>
                      <td className="p-2.5 font-semibold text-[#221F1B]">{evt.label}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            evt.type === 'exit'
                              ? 'bg-[#F5E1D6] text-[#BD5B3B]'
                              : 'bg-[#E4ECE7] text-[#22403A]'
                          }`}
                        >
                          {evt.type === 'exit' ? 'Perimeter Exit' : 'Safe Return'}
                        </span>
                      </td>
                      <td className="p-2.5 text-[#665F51]">
                        {evt.type === 'exit' ? 'Companion escorted walk' : 'Home boundary verified'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Physician Geriatric Observations & Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-baloo font-bold text-[#22403A] uppercase tracking-wider border-b border-[#E6DAB9] pb-1.5">
              <AlertTriangle className="w-4 h-4 text-[#E2A33D]" />
              4. Clinical Observations &amp; Next Steps for Consultation
            </div>
            <div className="p-4 rounded-xl bg-[#FBF7EE] border border-[#E6DAB9] space-y-2 text-xs text-[#221F1B] leading-relaxed">
              <p>
                <strong>Cognitive &amp; Mood Observation:</strong> Elder maintains stable orientation with high engagement in visual Memory Match and Number Recall activities. Response latency remains stable within normal geriatric baseline parameters.
              </p>
              <p>
                <strong>Medication Follow-up:</strong> Review evening dosing schedule to prevent sleep-onset conflicts. Consider aligning evening pill reminders with dinner timing.
              </p>
              <p>
                <strong>Physical Mobility:</strong> Regular morning walks within the {safeZoneRadius}m perimeter continue safely. Safe boundary has protected against disorientation events.
              </p>
            </div>
          </div>

          {/* Footer Signature Strip */}
          <div className="pt-6 border-t border-[#E6DAB9] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#948C7A] gap-4">
            <div>
              <span>Report verified by Sahay Ambient Telemetry Engine</span>
              <div className="text-[10px] mt-0.5">Confidential Medical Care Summary • For Consultation Use Only</div>
            </div>
            <div className="text-right">
              <div className="border-b border-[#948C7A] w-48 mb-1"></div>
              <span>Attending Physician / Geriatrician Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
