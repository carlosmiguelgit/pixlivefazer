import { useState, useRef, useEffect } from "react";
import { Notification } from "../types";
import { RESPOSTAS_AGENUARDAR, RESPOSTAS_RECEBIMENTO } from "../constants";

interface PrivateChatProps {
  username: string;
  nickname: string;
  fullName?: string;
  avatar: string;
  followingCount?: number;
  followerCount?: number;
  pixKey?: string;
  initialMessage?: string;
  onComplete: (name: string, pixKey: string) => void;
  onBack: () => void;
  onBotMessage?: (text: string) => void;
  fraseEspera?: string;
  fraseAgradecimento?: string;
  notification?: Notification | null;
  onOpenNubank?: (notification: Notification) => void;
  historyMessages?: { text: string; sender: 'me' | 'them'; timestamp?: number }[];
  onHistoryUpdate?: (messages: { text: string; sender: 'me' | 'them'; timestamp?: number }[]) => void;
  nubankCompleted?: boolean;
  onFlowEnd?: () => void;
}

export default function PrivateChat({ username, nickname, fullName, avatar, followingCount, followerCount, pixKey, initialMessage, onComplete, onBack, onBotMessage, fraseEspera, fraseAgradecimento, notification, onOpenNubank, historyMessages, onHistoryUpdate, nubankCompleted, onFlowEnd }: PrivateChatProps) {
  const [messages, setMessages] = useState<{ text: string; sender: 'me' | 'them'; timestamp: number }[]>(
    historyMessages && historyMessages.length > 0
      ? historyMessages.map((m, i) => ({ ...m, timestamp: m.timestamp || Date.now() - (historyMessages.length - i) * 60000 }))
      : initialMessage ? [{ text: initialMessage, sender: 'them', timestamp: Date.now() }] : []
  );
  const [inputText, setInputText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showVisto, setShowVisto] = useState(false);
  const [agradecimentoEnviado, setAgradecimentoEnviado] = useState(false);

  const respondeuRef = useRef(historyMessages ? historyMessages.filter(m => m.sender === 'me').length > 0 : false);
  const agradeceuRef = useRef(historyMessages ? historyMessages.filter(m => m.sender === 'me').length > 1 : false);
  const finalizouRef = useRef(false);

  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const lastBotMsg = [...historyMessages].reverse().find(m => m.sender === 'them');
      if (lastBotMsg && fraseAgradecimento && lastBotMsg.text === fraseAgradecimento) {
        setAgradecimentoEnviado(true);
      }
    }
  }, [historyMessages, fraseAgradecimento]);

  function agendarRespostaEspera() {
    const texto = fraseEspera || "ok, to esperando";
    setShowVisto(true);
    const delayResponse = texto.length > 80 ? 18000 + Math.random() * 5000 : 8000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      onBotMessage?.(texto);
    }, delayResponse);
  }

  function gerarAgradecimento() {
    // Usar fraseAgradecimento do usuário ou buscar na lista baseado no valor
    let texto = fraseAgradecimento;
    if (!texto && notification) {
      const valor = notification.contributionAmount;
      const faixa = valor <= 90 ? 'baixa' : 'alta';
        const poolAgrad = RESPOSTAS_AGENUARDAR.filter(r => r.faixa === faixa);
        texto = poolAgrad[Math.floor(Math.random() * poolAgrad.length)].texto || "obrigado";
    }
    texto = texto || "obrigado";
    setShowVisto(true);
    const delayResponse = texto.length > 80 ? 18000 + Math.random() * 5000 : 8000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      setAgradecimentoEnviado(true);
      onBotMessage?.(texto);
      onFlowEnd?.();
    }, delayResponse);
  }

  function gerarRespostaFinal() {
    // Resposta final baseada no valor - mais desesperada ou mais confiante
    let frases: string[];
    if (notification && notification.contributionAmount <= 90) {
      // Faixa baixa - mais emotiva
      frases = [
        "obg de coracao, vai ajudar muito",
        "obrigadao, Deus te pague",
        "vlw msm, salvou minha semana",
        "obg, to sem palavras",
        "chegou certinho, muito obg"
      ];
    } else {
      // Faixa alta - mais objetiva
      frases = [
        "show, to dentro de novo",
        "perfeito, quando tem outro ciclo?",
        "beleza, ja quero participar mais",
        "certo, to no aguardo do proximo",
        "otimo, valeu a pena"
      ];
    }
    const texto = frases[Math.floor(Math.random() * frases.length)];
    setShowVisto(true);
    const delayResponse = 6000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      onBotMessage?.(texto);
      onFlowEnd?.();
      setTimeout(() => {
        if (notification) {
          onComplete(notification.name, notification.pixKey);
        }
      }, 1000);
    }, delayResponse);
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return `Hoje ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    const newMessages = [...messages, { text, sender: 'me' as const, timestamp: Date.now() }];
    setMessages(newMessages);
    setInputText("");
    if (onHistoryUpdate) {
      onHistoryUpdate(newMessages);
    }

    const isRepetido = !!notification?.alerta;

    if (isRepetido) {
      if (!respondeuRef.current) {
        respondeuRef.current = true;
        gerarAgradecimento();
      }
    } else {
      if (!respondeuRef.current) {
        respondeuRef.current = true;
        agendarRespostaEspera();
      } else if (!agradeceuRef.current) {
        agradeceuRef.current = true;
        gerarAgradecimento();
      } else if (!finalizouRef.current) {
        finalizouRef.current = true;
        gerarRespostaFinal();
      }
    }
  }

  useEffect(() => {
    if (onHistoryUpdate && messages.length > 0) {
      onHistoryUpdate(messages);
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 pt-[50px] pb-2.5 bg-[#0a0a0a] shrink-0">
        <button onClick={onBack} className="p-1 -ml-1 text-white shrink-0">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-white">
            <path d="M14 5L9 11L14 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-[30px] h-[30px] rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-600">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex flex-col -mt-[10px]">
          <span className="text-[18px] font-semibold text-white truncate leading-tight">{nickname}</span>
          <span className="text-[14px] text-zinc-400 leading-tight">Ativo agora</span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-[3px] shrink-0 pr-1">
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-[52px] pb-6 shrink-0 bg-[#0a0a0a]">
        <div className="w-[76px] h-[76px] rounded-full bg-zinc-700 overflow-hidden border-2 border-zinc-600 mb-3 shrink-0">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[24px] font-bold text-white mb-1">{nickname}</span>
        <span className="text-[14px] text-zinc-400 mb-0.5">@{username}</span>
        {followingCount !== undefined && followerCount !== undefined && (
          <span className="text-[14px] text-zinc-500 mb-2">{followingCount.toLocaleString('pt-BR')} seguindo · {followerCount.toLocaleString('pt-BR')} seguidores</span>
        )}

      </div>

      <div className="flex-1 bg-[#0a0a0a] overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-center text-[11px] text-zinc-500 leading-none mt-1">{formatTime(msg.timestamp)}</span>
            {msg.sender === 'me' ? (
              <div className="flex flex-col items-end gap-1">
                <div className="bg-[#7c3aed] text-white text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words">{msg.text}</div>
                {showVisto && i === messages.length - 1 && <span className="text-[10px] text-zinc-500 leading-none pr-1">Visto</span>}
              </div>
            ) : (
              <div className="flex items-end gap-2 select-none">
                <div className="w-[28px] h-[28px] rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-600">
                  <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="bg-[#2a2a2a] text-white text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 px-3 pb-3 pt-1.5">
        <div className="bg-[#1a1a1a] rounded-full flex items-center gap-2 px-3.5 py-2.5">
          <button className="shrink-0 w-[17px] h-[15px]">
            <img src="/camera.png" alt="" className="w-full h-full object-contain" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Mensagem..."
            className="text-[16px] text-white flex-1 bg-transparent outline-none placeholder-zinc-500 pl-2"
          />
          <button
            type="button"
            onClick={() => {
              if (!nubankCompleted && notification && onOpenNubank) {
                onOpenNubank(notification);
              }
            }}
            className="cursor-pointer"
          >
            <img src="/d.png" alt="" className="w-[22px] h-[22px] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
