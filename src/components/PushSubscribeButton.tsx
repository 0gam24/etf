'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

interface Props {
  /** VAPID 공개키 (NEXT_PUBLIC_VAPID_PUBLIC_KEY 에 등록) */
  publicKey?: string;
}

/**
 * PushSubscribeButton — 사용자에게 알림 구독 허용 여부 요청.
 *
 *   비로그인 · 익명. endpoint URL 해시만 KV 에 저장.
 *   카테고리: 분배락일·시그널·변동성 (브라우저 localStorage 에 ON/OFF)
 *
 *   ⚠️ VAPID 공개키 미설정 시 비활성.
 */
const STORAGE_KEY = 'push-subscribed-v1';
const CATEGORIES_KEY = 'push-categories-v1';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(safe);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushSubscribeButton({ publicKey }: Props) {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }
    setSubscribed(!!localStorage.getItem(STORAGE_KEY));
  }, []);

  async function handleSubscribe() {
    if (!publicKey) {
      alert('VAPID 공개키 미설정 — 운영자에게 문의');
      return;
    }
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('알림 권한이 필요합니다');
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subJson = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          categories: ['dividend', 'signal', 'volatility'],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(['dividend', 'signal', 'volatility']));
      setSubscribed(true);
    } catch (err) {
      console.error(err);
      alert('구독 실패: ' + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const subJson = sub.toJSON();
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            unsubscribe: true,
          }),
        });
        await sub.unsubscribe();
      }
      localStorage.removeItem(STORAGE_KEY);
      setSubscribed(false);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  if (!supported) {
    return (
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        ⚠️ 브라우저가 Web Push 미지원
      </span>
    );
  }

  if (subscribed) {
    return (
      <button
        onClick={handleUnsubscribe}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 0.9rem',
          background: 'var(--emerald-400)',
          color: '#0B0E14',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <BellOff size={14} strokeWidth={2.4} />
        알림 구독 중 (해제)
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.9rem',
        background: 'var(--accent-gold)',
        color: '#0B0E14',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      <Bell size={14} strokeWidth={2.4} />
      알림 받기 (무료 · 익명)
    </button>
  );
}
