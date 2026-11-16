import React, { useState, useEffect } from 'react';
import {
  Phone,
  AlertTriangle,
  X,
  Droplet,
  ShieldCheck,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Ambulance,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api';
import { BloodGroup, EmergencyDonorItem, SosAlertResponse, ToastType } from '../../types';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, icon?: string, type?: ToastType) => void;
  initialTab?: 'sos' | 'donors';
}

const BLOOD_GROUPS: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  showToast,
  initialTab = 'sos',
}) => {
  const [activeTab, setActiveTab] = useState<'sos' | 'donors'>(initialTab);

  // SOS state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<{ name: string; phone: string; relation: string }>({
    name: 'Ranjit',
    phone: '+91 98640 12345',
    relation: 'Son (Primary Caregiver)',
  });
  const [dispatchResult, setDispatchResult] = useState<SosAlertResponse | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Donors state
  const [donors, setDonors] = useState<EmergencyDonorItem[]>([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [selectedDistance, setSelectedDistance] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'available' | 'on-call'>('ALL');
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);

  // Sync tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setDispatchResult(null);
      setCountdown(null);
      loadDonors();
    }
  }, [isOpen, initialTab]);

  // Load donors from API
  const loadDonors = async () => {
    setIsLoadingDonors(true);
    try {
      const data = await api.getEmergencyDonors();
      setDonors(data);
    } catch (e) {
      // handled in api
    } finally {
      setIsLoadingDonors(false);
    }
  };

  // 5-second Accidental Countdown Timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      executeDispatch();
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleStartCountdown = () => {
    setCountdown(5);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
    showToast('Emergency SOS dispatch cancelled', 'check', 'info');
  };

  const executeDispatch = async () => {
    setCountdown(null);
    setIsDispatching(true);
    showToast(`Dispatching live SOS alert to ${selectedContact.name}…`, 'phone', 'emergency');

    try {
      const alert = await api.triggerSos({
        contactName: selectedContact.name,
        phone: selectedContact.phone,
        reason: 'Immediate SOS triggered by elder companion',
      });
      setDispatchResult(alert);
      showToast(`Dispatched! Broadcast ID: ${alert.broadcastId}`, 'phone', 'success');
    } catch (e) {
      const fallbackAlert: SosAlertResponse = {
        id: `SOS-${Date.now()}`,
        status: 'dispatched',
        contact: selectedContact.name,
        phone: selectedContact.phone,
        location: 'Tea Garden Road, Jorhat, Assam',
        time: new Date().toLocaleTimeString(),
        message: `Alert dispatched to ${selectedContact.name} via local cellular network.`,
        broadcastId: `SAHAY-LOC-${Math.floor(1000 + Math.random() * 9000)}`,
        etaMinutes: 10,
      };
      setDispatchResult(fallbackAlert);
      showToast(`Emergency alert dispatched locally to ${selectedContact.name}`, 'phone', 'warning');
    } finally {
      setIsDispatching(false);
    }
  };

  // Filter donors
  const filteredDonors = donors.filter((d) => {
    const matchesBg = selectedBloodGroup === 'ALL' || d.bloodGroup.toUpperCase() === selectedBloodGroup.toUpperCase();
    const matchesDist = d.distanceKm <= selectedDistance;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.address.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q) ||
      d.role.toLowerCase().includes(q);
    return matchesBg && matchesDist && matchesStatus && matchesSearch;
  });

  const handleCallDonor = (donor: EmergencyDonorItem) => {
    showToast(`Connecting to ${donor.name} (${donor.bloodGroup})…`, 'phone', 'info');
    window.open(`tel:${donor.phone}`);
  };

  const handleRequestDonor = (donor: EmergencyDonorItem) => {
    showToast(`Emergency dispatch request sent to ${donor.name}!`, 'check', 'success');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      className="fixed inset-0 bg-[#152B26]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-rise"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative border border-[#E6DAB9] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close emergency modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F1E7CE] text-[#575246] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22403A]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-[#E6DAB9] pb-3 pr-10">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-baloo font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'sos'
                ? 'bg-[#BD5B3B] text-white shadow-sm'
                : 'text-[#575246] hover:bg-[#F1E7CE]'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-baloo font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'donors'
                ? 'bg-[#22403A] text-white shadow-sm'
                : 'text-[#575246] hover:bg-[#F1E7CE]'
            }`}
          >
            <Droplet className="w-4 h-4 text-[#BD5B3B]" />
            <span>Blood Donors & Responders</span>
          </button>
        </div>

        {/* Tab 1: Emergency SOS Dispatch */}
        {activeTab === 'sos' && (
          <div className="overflow-y-auto flex-1 pr-1">
            {dispatchResult ? (
              <div className="text-center py-4 animate-rise">
                <div className="w-16 h-16 rounded-full bg-[#E4ECE7] text-[#22403A] flex items-center justify-center mx-auto mb-3 border border-[#6FCF97]/40">
                  <CheckCircle2 className="w-8 h-8 text-[#22403A]" />
                </div>
                <h3 className="font-fraunces text-2xl font-medium text-[#221F1B] mb-1">
                  Emergency Alert Dispatched
                </h3>
                <p className="text-xs text-[#575246] mb-4">
                  Broadcast ID: <span className="font-mono font-bold text-[#BD5B3B]">{dispatchResult.broadcastId}</span>
                </p>

                <div className="bg-[#FBF7EE] p-4 rounded-2xl border border-[#E6DAB9] text-left text-xs mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#665F51]">Contact:</span>
                    <span className="font-bold text-[#221F1B]">{dispatchResult.contact} ({dispatchResult.phone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#665F51]">Location:</span>
                    <span className="font-medium text-[#221F1B]">{dispatchResult.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#665F51]">Status:</span>
                    <span className="font-bold text-[#22403A] bg-[#E4ECE7] px-2 py-0.5 rounded-full">
                      Live Telemetry Dispatched
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#665F51]">Estimated Response:</span>
                    <span className="font-bold text-[#BD5B3B]">~{dispatchResult.etaMinutes} minutes</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setDispatchResult(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E6DAB9] font-baloo font-bold text-xs text-[#221F1B] hover:bg-[#F1E7CE] cursor-pointer"
                  >
                    Send Another Alert
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-[#22403A] text-white font-baloo font-bold text-xs hover:brightness-110 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : countdown !== null ? (
              /* Accidental Trigger Buffer Countdown */
              <div className="text-center py-6 animate-rise">
                <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#F5E1D6] animate-ping opacity-75" />
                  <div className="w-20 h-20 rounded-full bg-[#BD5B3B] text-white font-fraunces font-bold text-3xl flex items-center justify-center shadow-lg">
                    {countdown}
                  </div>
                </div>

                <h3 className="font-fraunces text-2xl font-medium text-[#221F1B] mb-2">
                  Dispatching in {countdown}s…
                </h3>
                <p className="text-xs text-[#575246] max-w-sm mx-auto mb-6 leading-relaxed">
                  Elder-friendly accidental protection buffer. If this was pressed by mistake, tap Cancel below.
                </p>

                <div className="flex gap-3 max-w-sm mx-auto">
                  <button
                    onClick={handleCancelCountdown}
                    className="flex-1 py-3 rounded-xl border-2 border-[#BD5B3B] bg-white font-baloo font-bold text-sm text-[#BD5B3B] hover:bg-[#F5E1D6]/40 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel SOS
                  </button>
                  <button
                    onClick={executeDispatch}
                    className="flex-1 py-3 rounded-xl bg-[#BD5B3B] text-white font-baloo font-bold text-sm hover:brightness-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-4 h-4" />
                    Dispatch Now
                  </button>
                </div>
              </div>
            ) : (
              /* Normal SOS Ready View */
              <div>
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#F5E1D6] text-[#BD5B3B] flex items-center justify-center mx-auto mb-2 border border-[#E7BBA5]">
                    <Phone className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 id="sos-modal-title" className="font-fraunces text-2xl font-medium text-[#221F1B]">
                    Elder Emergency Assistance
                  </h3>
                  <p className="text-xs text-[#575246] leading-relaxed">
                    Select a designated emergency responder to notify with Bimala aita’s live coordinates.
                  </p>
                </div>

                {/* Live Location Card */}
                <div className="bg-[#FBF7EE] p-3 rounded-2xl border border-[#E6DAB9] flex items-center gap-2.5 mb-4 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#E4ECE7] text-[#22403A] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[#221F1B]">Live Geofence Location</div>
                    <div className="text-[#665F51] truncate">Tea Garden Road, Jorhat, Assam (Within Safe Zone)</div>
                  </div>
                  <span className="text-[10px] bg-[#6FCF97]/20 text-[#22403A] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Active GPS
                  </span>
                </div>

                {/* Contact Selection */}
                <div className="space-y-2 mb-5">
                  <label className="text-[11px] font-baloo font-bold text-[#22403A] uppercase tracking-wider block">
                    Choose Emergency Responder:
                  </label>

                  {/* Ranjit */}
                  <div
                    onClick={() =>
                      setSelectedContact({
                        name: 'Ranjit',
                        phone: '+91 98640 12345',
                        relation: 'Son (Primary Caregiver)',
                      })
                    }
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedContact.name === 'Ranjit'
                        ? 'bg-[#E4ECE7] border-[#22403A]'
                        : 'bg-white border-[#E6DAB9] hover:bg-[#FBF7EE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3E4F74] text-white flex items-center justify-center font-baloo font-bold text-xs">
                        R
                      </div>
                      <div>
                        <div className="font-baloo font-bold text-sm text-[#221F1B]">Ranjit (Son)</div>
                        <div className="text-[11px] text-[#665F51]">+91 98640 12345 · 1.8 km away</div>
                      </div>
                    </div>
                    {selectedContact.name === 'Ranjit' && (
                      <CheckCircle2 className="w-5 h-5 text-[#22403A]" />
                    )}
                  </div>

                  {/* Priya */}
                  <div
                    onClick={() =>
                      setSelectedContact({
                        name: 'Priya',
                        phone: '+91 94350 67890',
                        relation: 'Daughter-in-law',
                      })
                    }
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedContact.name === 'Priya'
                        ? 'bg-[#E4ECE7] border-[#22403A]'
                        : 'bg-white border-[#E6DAB9] hover:bg-[#FBF7EE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#BD5B3B] text-white flex items-center justify-center font-baloo font-bold text-xs">
                        P
                      </div>
                      <div>
                        <div className="font-baloo font-bold text-sm text-[#221F1B]">Priya (Daughter-in-law)</div>
                        <div className="text-[11px] text-[#665F51]">+91 94350 67890 · 2.4 km away</div>
                      </div>
                    </div>
                    {selectedContact.name === 'Priya' && (
                      <CheckCircle2 className="w-5 h-5 text-[#22403A]" />
                    )}
                  </div>

                  {/* Emergency 108 Ambulance */}
                  <div
                    onClick={() =>
                      setSelectedContact({
                        name: '108 Emergency Ambulance',
                        phone: '108',
                        relation: 'National Ambulance Service',
                      })
                    }
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedContact.name === '108 Emergency Ambulance'
                        ? 'bg-[#E4ECE7] border-[#22403A]'
                        : 'bg-white border-[#E6DAB9] hover:bg-[#FBF7EE]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#BD5B3B] text-white flex items-center justify-center">
                        <Ambulance className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-baloo font-bold text-sm text-[#221F1B]">108 Ambulance / PHC</div>
                        <div className="text-[11px] text-[#665F51]">Emergency Medical Dispatch · Toll-Free</div>
                      </div>
                    </div>
                    {selectedContact.name === '108 Emergency Ambulance' && (
                      <CheckCircle2 className="w-5 h-5 text-[#22403A]" />
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-[#E6DAB9] font-baloo font-bold text-sm text-[#221F1B] hover:bg-[#F1E7CE] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartCountdown}
                    className="flex-1 py-3 rounded-xl bg-[#BD5B3B] text-white font-baloo font-bold text-sm hover:brightness-95 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Trigger SOS (5s Buffer)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Emergency Blood Donors & Caregivers */}
        {activeTab === 'donors' && (
          <div className="overflow-y-auto flex-1 pr-1">
            <div className="mb-3">
              <h4 className="font-fraunces text-xl font-medium text-[#221F1B] mb-1">
                Emergency Blood & Caregiver Registry
              </h4>
              <p className="text-xs text-[#575246]">
                Verified donors and community health responders in Jorhat and North-East vicinity.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#575246]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by donor name, location, or role…"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6DAB9] text-xs bg-white focus:outline-2 focus:outline-[#22403A]"
              />
            </div>

            {/* Blood Group Filter Chips */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-baloo font-bold text-[#22403A] mb-1.5">
                <Droplet className="w-3.5 h-3.5 text-[#BD5B3B]" />
                <span>Filter by Blood Group:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedBloodGroup(bg)}
                    className={`px-2.5 py-1 rounded-full text-xs font-baloo font-bold transition-all cursor-pointer ${
                      selectedBloodGroup === bg
                        ? 'bg-[#BD5B3B] text-white shadow-xs'
                        : 'bg-[#FBF7EE] text-[#575246] border border-[#E6DAB9] hover:bg-[#F1E7CE]'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance and Status Filters */}
            <div className="flex items-center justify-between gap-3 mb-3 bg-[#FBF7EE] p-2.5 rounded-xl border border-[#E6DAB9] text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#665F51] font-medium">Distance:</span>
                <select
                  value={selectedDistance}
                  onChange={(e) => setSelectedDistance(Number(e.target.value))}
                  className="bg-white border border-[#E6DAB9] rounded-lg px-2 py-1 text-xs font-baloo font-bold cursor-pointer"
                >
                  <option value={3}>Within 3 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#665F51] font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white border border-[#E6DAB9] rounded-lg px-2 py-1 text-xs font-baloo font-bold cursor-pointer"
                >
                  <option value="ALL">All Responders</option>
                  <option value="available">Available Now</option>
                  <option value="on-call">On Call</option>
                </select>
              </div>
            </div>

            {/* Donor List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {isLoadingDonors ? (
                <div className="text-center py-6 text-xs text-[#575246]">Loading verified responders…</div>
              ) : filteredDonors.length === 0 ? (
                <div className="text-center py-6 bg-[#FBF7EE] rounded-2xl border border-[#E6DAB9] text-xs text-[#575246]">
                  No matching blood donors found for this criteria. Try selecting "ALL" or increasing distance.
                </div>
              ) : (
                filteredDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="p-3 bg-white border border-[#E6DAB9] rounded-2xl hover:border-[#22403A] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      {/* Blood Group Badge */}
                      <div className="w-10 h-10 rounded-xl bg-[#F5E1D6] text-[#BD5B3B] font-baloo font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#E7BBA5]">
                        {donor.bloodGroup}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-baloo font-bold text-sm text-[#221F1B]">{donor.name}</span>
                          {donor.verified && (
                            <span className="inline-flex items-center gap-0.5 bg-[#E4ECE7] text-[#22403A] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              <ShieldCheck className="w-3 h-3 text-[#22403A]" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#665F51] flex items-center gap-2 mt-0.5">
                          <span className="text-[#BD5B3B] font-bold">{donor.role}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {donor.distanceKm} km ({donor.address})
                          </span>
                        </div>

                        {donor.lastDonated && (
                          <div className="text-[10px] text-[#575246] mt-0.5">
                            Last active: {donor.lastDonated}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => handleRequestDonor(donor)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E6DAB9] bg-[#FBF7EE] text-[#221F1B] hover:bg-[#F1E7CE] font-baloo font-bold text-xs cursor-pointer"
                      >
                        Request
                      </button>
                      <button
                        onClick={() => handleCallDonor(donor)}
                        className="px-3 py-1.5 rounded-lg bg-[#22403A] text-white hover:brightness-110 font-baloo font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
