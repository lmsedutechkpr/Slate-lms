'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Shield, Wallet, Globe, Smartphone, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SellerSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Dummy settings state for UI simulation
  const [settings, setSettings] = useState({
    emailNotifs: true,
    pushNotifs: false,
    orderAlerts: true,
    reviewAlerts: true,
    stockAlerts: true,
    publicStore: true,
    currency: 'INR',
    language: 'English'
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings updated successfully');
    }, 800);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
        checked ? "bg-emerald-500" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your preferences, notifications, and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Nav (Visual Only for Layout) */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm transition-colors text-left">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm transition-colors text-left">
            <Globe className="w-4 h-4" /> Preferences
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm transition-colors text-left">
            <Shield className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 font-medium rounded-xl text-sm transition-colors text-left">
            <Wallet className="w-4 h-4" /> Payout & Tax
          </button>
        </div>

        {/* Right Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Notifications Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Notification Preferences</h3>
              <p className="text-xs text-gray-500 mt-1">Choose how and when you want to be alerted.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive daily summaries and critical alerts via email.</p>
                    </div>
                  </div>
                  <Toggle checked={settings.emailNotifs} onChange={v => setSettings({...settings, emailNotifs: v})} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                      <p className="text-xs text-gray-500 mt-0.5">Receive real-time alerts on your device.</p>
                    </div>
                  </div>
                  <Toggle checked={settings.pushNotifs} onChange={v => setSettings({...settings, pushNotifs: v})} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trigger Events</h4>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">New Orders</p>
                  <Toggle checked={settings.orderAlerts} onChange={v => setSettings({...settings, orderAlerts: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Product Reviews & Ratings</p>
                  <Toggle checked={settings.reviewAlerts} onChange={v => setSettings({...settings, reviewAlerts: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Low Stock Warnings</p>
                  <Toggle checked={settings.stockAlerts} onChange={v => setSettings({...settings, stockAlerts: v})} />
                </div>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex justify-end px-8">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
