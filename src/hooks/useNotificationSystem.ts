import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, Testimonial } from '../types';
import { MENSAGENS_INICIAIS, RESPOSTAS_ESPERA, RESPOSTAS_MESES } from '../constants';
import tiktokUsers from '../tiktok-users.json';

interface TikTokUser {
  username: string;
  nickname: string;
  fullName?: string;
  avatar: string;
  followingCount?: number;
  followerCount?: number;
  repetido?: boolean;
  initialMessage?: string;
  justificativa?: string;
}

interface PendingTestimonial extends Testimonial {
  visibleAt: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const allUsers = tiktokUsers as TikTokUser[];
const normalPool = shuffle(allUsers.filter(u => !u.repetido));
const repetidoPool = shuffle(allUsers.filter(u => u.repetido));

const NOMES_FEMININOS_ATIPICOS = ['jeneffer', 'dayane'];

function inferirGenero(nome: string): 'male' | 'female' {
  const primeiro = (nome || '').trim().split(/\s+/)[0]?.toLowerCase() || '';
  if (NOMES_FEMININOS_ATIPICOS.includes(primeiro)) return 'female';
  return primeiro.endsWith('a') ? 'female' : 'male';
}

function montarMensagemInicial(genero: 'male' | 'female', nome: string, idx: number, meses: number): string {
  const pool = MENSAGENS_INICIAIS.filter(m => m.genero === genero);
  const mesesTexto = meses === 1 ? 'mês' : 'meses';
  return pool[idx % pool.length].texto
    .replace('[MESES]', String(meses))
    .replace('[MESES_TEXTO]', mesesTexto)
    .replace('do [NOME]', (genero === 'female' ? 'da ' : 'do ') + nome);
}

export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<PendingTestimonial[]>([]);
  const [unreadDepoimentos, setUnreadDepoimentos] = useState(0);

  const normalOrderRef = useRef<TikTokUser[]>([]);
  const repetidoOrderRef = useRef<TikTokUser[]>([]);
  const messageCountRef = useRef(0);
  const confirmedBlacklistRef = useRef<string[]>([]);
  const monthsCycleRef = useRef<number[]>([]);
  const monthsIndexRef = useRef(0);
  const inicialMaleIdxRef = useRef(0);
  const inicialFemaleIdxRef = useRef(0);
  const esperaMaleIdxRef = useRef(0);
  const esperaFemaleIdxRef = useRef(0);
  const agradecimentoIdxRef = useRef(0);

  const getNextEntry = useCallback((): number => {
    if (monthsIndexRef.current >= monthsCycleRef.current.length) {
      const pool = [1,1,1,1, 2,2,2, 3,3,3, 4,4, 5,5, 6,6, 7, 8, 9, 10, 11, 12];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      monthsCycleRef.current = pool;
      monthsIndexRef.current = 0;
    }
    return monthsCycleRef.current[monthsIndexRef.current++];
  }, []);

  const getNextUser = useCallback((months: number): TikTokUser | null => {
    const isRepetido = months === 12;
    const pool = isRepetido ? repetidoPool : normalPool;
    const orderRef = isRepetido ? repetidoOrderRef : normalOrderRef;
    if (pool.length === 0) return null;
    if (orderRef.current.length === 0) {
      orderRef.current = shuffle(pool);
    }
    const user = orderRef.current[0];
    orderRef.current = orderRef.current.slice(1);
    messageCountRef.current++;
    return user;
  }, []);

  const generateNotification = useCallback(() => {
    const months = getNextEntry();
    const user = getNextUser(months);
    if (!user) return;

    const alerta = !!user.repetido;
    const genero = inferirGenero(user.fullName || user.nickname);
    const nomeCompleto = user.fullName || user.nickname;

    let initialMessage: string;
    const mesesTexto = months === 1 ? 'mês' : 'meses';
    if (user.initialMessage) {
      initialMessage = user.initialMessage.replace('[NOME]', nomeCompleto).replace('[MESES]', String(months)).replace('[MESES_TEXTO]', mesesTexto);
    } else {
      const poolInicial = MENSAGENS_INICIAIS.filter(m => m.genero === genero);
      const inicialIdxRef = genero === 'female' ? inicialFemaleIdxRef : inicialMaleIdxRef;
      const idxInicial = inicialIdxRef.current;
      inicialIdxRef.current = (idxInicial + 1) % poolInicial.length;
      initialMessage = montarMensagemInicial(genero, nomeCompleto, idxInicial, months);
    }

    const poolEspera = RESPOSTAS_ESPERA.filter(r => r.genero === genero);
    const esperaIdxRef = genero === 'female' ? esperaFemaleIdxRef : esperaMaleIdxRef;
    const idxEspera = esperaIdxRef.current;
    esperaIdxRef.current = (idxEspera + 1) % poolEspera.length;

    const fraseEspera = poolEspera[idxEspera].texto;

    let fraseAgradecimento: string;
    if (user.justificativa) {
      fraseAgradecimento = user.justificativa;
    } else {
      fraseAgradecimento = RESPOSTAS_MESES[agradecimentoIdxRef.current];
      agradecimentoIdxRef.current = (agradecimentoIdxRef.current + 1) % RESPOSTAS_MESES.length;
    }

    const newNotif: Notification = {
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      name: user.nickname,
      username: user.username,
      fullName: user.fullName,
      photo: user.avatar,
      followingCount: user.followingCount,
      followerCount: user.followerCount,
      pixKey: `${Math.floor(Math.random() * 899) + 100}.***.***-${Math.floor(Math.random() * 89) + 10}`,
      months: months,
      participationCount: months,
      value: 0,
      timestamp: new Date(),
      gender: genero,
      alerta,
      contributionAmount: months,
      initialMessage,
      fraseEspera,
      fraseAgradecimento,
      read: false
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 11)]);

    const payload = {
      id: newNotif.id,
      name: newNotif.name,
      username: newNotif.username,
      pixKey: newNotif.pixKey,
      value: newNotif.value,
      contributionAmount: newNotif.contributionAmount,
      photo: newNotif.photo,
      fullName: newNotif.fullName,
      gender: newNotif.gender,
      months: newNotif.months,
      followingCount: newNotif.followingCount,
      followerCount: newNotif.followerCount,
      alerta: newNotif.alerta,
    };

    setTimeout(() => {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, 3000);
  }, [getNextUser, getNextEntry]);

  // Manual trigger only — no auto-generation

  const addToBlacklist = useCallback((name: string) => {
    confirmedBlacklistRef.current = [name, ...confirmedBlacklistRef.current].slice(0, 30);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPendingTestimonials(prev => {
        const ready = prev.filter(t => t.visibleAt <= now);
        if (ready.length > 0) {
          setDynamicTestimonials(current => {
            const newItems = ready.filter(r => !current.some(c => c.id === r.id));
            if (newItems.length > 0) {
              setUnreadDepoimentos(u => u + newItems.length);
              return [...newItems, ...current];
            }
            return current;
          });
          return prev.filter(t => t.visibleAt > now);
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    setNotifications,
    dynamicTestimonials,
    unreadDepoimentos,
    setUnreadDepoimentos,
    setPendingTestimonials,
    addToBlacklist,
    generateNotification
  };
};
