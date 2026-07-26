import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

let ipCache: string | null = null;

async function getClientIp(): Promise<string> {
  if (ipCache) return ipCache;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.ip) {
      ipCache = data.ip;
      return data.ip;
    }
  } catch (e) {
    console.warn("Could not fetch IP, falling back to local identifier.");
  }
  
  // Fallback to a browser-specific persistent ID (acting as a unique visitor IP identifier)
  let fallbackIp = localStorage.getItem('visitor_fallback_ip');
  if (!fallbackIp) {
    fallbackIp = 'local-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('visitor_fallback_ip', fallbackIp);
  }
  return fallbackIp;
}

export const TrafficTracker: React.FC = () => {
  const location = useLocation();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate logging for the exact same path in rapid succession
    if (lastLoggedPath.current === location.pathname) return;
    lastLoggedPath.current = location.pathname;

    const logView = async () => {
      try {
        const ip = await getClientIp();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        await supabase.from('traffic').insert({
          ip,
          path: location.pathname,
          timestamp: now.toISOString(),
          date: dateStr,
        });
      } catch (e) {
        console.error("Traffic logging error:", e);
      }
    };

    logView();
  }, [location.pathname]);

  return null;
};
