import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle, ArrowLeft, Users, PhoneCall, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [callbacks, setCallbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consulRes, callbackRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/consultations`),
        axios.get(`${API}/admin/callbacks`),
        axios.get(`${API}/admin/stats`),
      ]);
      setConsultations(consulRes.data);
      setCallbacks(callbackRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Admin fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      });
    } catch { return dateStr; }
  };

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              ASAP Fence & Gates
            </h1>
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Lead Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Button data-testid="admin-refresh-btn" onClick={fetchData} variant="outline" className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white text-sm">
              Refresh
            </Button>
            <a href="/">
              <Button variant="outline" className="border-stone-600 text-stone-300 hover:bg-stone-800 hover:text-white text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Site
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Leads", value: stats.totalConsultations, icon: Users, color: "text-stone-700" },
              { label: "Paid ($150)", value: stats.paidConsultations, icon: DollarSign, color: "text-emerald-600" },
              { label: "Pending Payment", value: stats.pendingConsultations, icon: AlertCircle, color: "text-amber-600" },
              { label: "Callback Requests", value: stats.totalCallbacks, icon: PhoneCall, color: "text-blue-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-stone-500 font-medium">{stat.label}</span>
                </div>
                <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="consultations">
          <TabsList className="mb-6">
            <TabsTrigger value="consultations">Consultation Leads ({consultations.length})</TabsTrigger>
            <TabsTrigger value="callbacks">Callback Requests ({callbacks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations">
            {loading ? (
              <div className="text-center py-12 text-stone-400">Loading...</div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-12 text-stone-400">No consultation leads yet</div>
            ) : (
              <div className="space-y-4">
                {consultations.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-stone-900 text-lg">{lead.fullName}</h3>
                          {lead.paymentStatus === "paid" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Paid $150</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending Payment</Badge>
                          )}
                        </div>
                        <div className="text-sm text-stone-400">{formatDate(lead.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`tel:${lead.phone?.replace(/[^0-9]/g, "")}`}>
                          <Button size="sm" className="bg-stone-900 hover:bg-stone-800 text-white text-xs">
                            <Phone className="w-3 h-3 mr-1" /> Call
                          </Button>
                        </a>
                        <a href={`mailto:${lead.email}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Mail className="w-3 h-3 mr-1" /> Email
                          </Button>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {lead.phone && (
                        <div>
                          <span className="text-stone-400 block text-xs">Phone</span>
                          <span className="text-stone-700 font-medium">{lead.phone}</span>
                          {lead.smsConsent && (
                            <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-medium">SMS opted in</span>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-stone-400 block text-xs">Email</span>
                        <span className="text-stone-700 break-all">{lead.email}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-stone-400 block text-xs">Property</span>
                        <span className="text-stone-700">{lead.address}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">Yard Size</span>
                        <span className="text-stone-700">{lead.yardSize}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">Project</span>
                        <span className="text-stone-700">{lead.projectType}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">Fence Style</span>
                        <span className="text-stone-700">{lead.fenceStyle || "Not specified"}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-xs">Timeline</span>
                        <span className="text-stone-700">{lead.timeline || "Not specified"}</span>
                      </div>
                    </div>

                    {lead.message && (
                      <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100 text-sm text-stone-600">
                        <span className="text-stone-400 text-xs block mb-1">Message</span>
                        {lead.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="callbacks">
            {callbacks.length === 0 ? (
              <div className="text-center py-12 text-stone-400">No callback requests yet</div>
            ) : (
              <div className="space-y-3">
                {callbacks.map((cb) => (
                  <div key={cb.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-900">{cb.name || "Unknown"}</div>
                      <div className="text-stone-500 text-sm">{cb.phone}</div>
                      <div className="text-stone-400 text-xs mt-1">{formatDate(cb.createdAt)}</div>
                    </div>
                    <a href={`tel:${cb.phone?.replace(/[^0-9]/g, "")}`}>
                      <Button size="sm" className="bg-stone-900 hover:bg-stone-800 text-white">
                        <Phone className="w-3 h-3 mr-1" /> Call Back
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
