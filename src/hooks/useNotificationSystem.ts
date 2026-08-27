import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification, Testimonial } from '../types';
import { MENSAGENS_INICIAIS, RESPOSTAS_ESPERA, RESPOSTAS_AGENUARDAR, RESPOSTAS_RECEBIMENTO } from '../constants';
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

function montarMensagemInicial(genero: 'male' | 'female', nome: string, idx: number, valor: number): string {
  const pool = MENSAGENS_INICIAIS.filter(m => m.genero === genero);
  return pool[idx % pool.length].texto
    .replace('[VALOR]', String(valor))
    .replace('do [NOME]', (genero === 'female' ? 'da ' : 'do ') + nome)
    .replace('[NOME]', nome);
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
  const valuesCycleRef = useRef<number[]>([]);
  const valuesIndexRef = useRef(0);
  const inicialMaleIdxRef = useRef(0);
  const inicialFemaleIdxRef = useRef(0);
  const esperaMaleIdxRef = useRef(0);
  const esperaFemaleIdxRef = useRef(0);
  const aguardarIdxRef = useRef(0);
  const recebimentoIdxRef = useRef(0);

  const getNextEntry = useCallback((): number => {
    if (valuesIndexRef.current >= valuesCycleRef.current.length) {
      // Pool de valores: 50 e 90 mais frequentes (pessoas desesperadas), 150 e 300 menos (gananciosos)
      const pool = [50,50,50,50, 90,90,90, 150,150, 300];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      valuesCycleRef.current = pool;
      valuesIndexRef.current = 0;
    }
    return valuesCycleRef.current[valuesIndexRef.current++];
  }, []);

  const getNextUser = useCallback((valor: number): TikTokUser | null => {
    // 300 = repetido (alerta), valor baixo = normal
    const isRepetido = valor === 300;
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
    const valor = getNextEntry();
    const user = getNextUser(valor);
    if (!user) return;

    const alerta = !!user.repetido;
    const genero = inferirGenero(user.fullName || user.nickname);
    const nomeCompleto = user.fullName || user.nickname;

    let initialMessage: string;
    if (user.initialMessage) {
      initialMessage = user.initialMessage.replace('[NOME]', nomeCompleto).replace('[VALOR]', String(valor));
    } else {
      const poolInicial = MENSAGENS_INICIAIS.filter(m => m.genero === genero);
      const inicialIdxRef = genero === 'female' ? inicialFemaleIdxRef : inicialMaleIdxRef;
      const idxInicial = inicialIdxRef.current;
      inicialIdxRef.current = (idxInicial + 1) % poolInicial.length;
      initialMessage = montarMensagemInicial(genero, nomeCompleto, idxInicial, valor);
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
      // Escolher entre RESPOSTAS_AGENUARDAR ou RESPOSTAS_RECEBIMENTO baseado no valor
      const faixa = valor <= 90 ? 'baixa' : 'alta';
      const poolAgradecimento = RESPOSTAS_AGENUARDAR.filter(r => r.faixa === faixa);
      const idxAgrad = aguardarIdxRef.current % poolAgradecimento.length;
      fraseAgradecimento = poolAgradecimento[idxAgrad].texto;
      aguardarIdxRef.current++;
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
      months: valor,
      participationCount: valor,
      value: 0,
      timestamp: new Date(),
      gender: genero,
      alerta,
      contributionAmount: valor,
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
