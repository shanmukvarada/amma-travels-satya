 'use client';

import { useState, useEffect, Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { User, updateProfile } from 'firebase/auth';
import { Mail, User as UserIcon, Calendar, ArrowLeft, Phone, MapPin, Edit2, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        setFullName(u.displayName || '');
        
        // Fetch extra details from server-side users API
        try {
          const resp = await fetch(`/api/users?uid=${encodeURIComponent(u.uid)}`);
          if (resp.ok) {
            const data = await resp.json();
            setPhone(data.phone || '');
            setAddress(data.address || '');
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        }
      } else {
        router.push('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (fullName !== user.displayName) {
        await updateProfile(user, { displayName: fullName });
      }
      await fetch(`/api/users?id=${encodeURIComponent(user.uid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, address, updatedAt: new Date().toISOString() }),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="max-w-xl mx-auto pb-10">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Home
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gray-950 px-8 py-6 relative">
          <div className="absolute top-6 right-6">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
            )}
          </div>
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}`} 
              alt="avatar" 
              className="w-24 h-24 rounded-full border-2 border-white object-cover shadow-sm bg-gray-100" 
            />
          </div>
        </div>
        
        <div className="px-8 pt-16 pb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.displayName || 'Traveler'}</h1>
          <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Logged in
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
                <UserIcon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Full Name</p>
                {isEditing ? (
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-600" />
                ) : (
                  <p className="text-gray-900 font-medium">{fullName || 'Not Provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
                <Phone size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Phone Number</p>
                {isEditing ? (
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-600" placeholder="e.g. 9876543210" />
                ) : (
                  <p className="text-gray-900 font-medium">{phone || 'Not Provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
                <MapPin size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Address</p>
                {isEditing ? (
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-600" placeholder="Your full address" />
                ) : (
                  <p className="text-gray-900 font-medium">{address || 'Not Provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400">
                <Calendar size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Account Created</p>
                <p className="text-gray-900 font-medium">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'}) : 'Unknown'}</p>
              </div>
            </div>
            
            <div className="mt-8 pt-4">
               <button onClick={() => auth.signOut()} className="w-full py-3.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition shadow-sm border border-red-100">
                 Sign Out of Amma Travels
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
