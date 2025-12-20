import { MessageSquare, Lightbulb, AlertTriangle, ThumbsUp } from "lucide-react"
import type { FeedbackOption, FaqItem } from "./types"

export const feedbackOptions: FeedbackOption[] = [
  {
    id: "reclamacao",
    label: "Reclamação",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "from-red-500/20 to-red-600/10 border-red-500/30",
    description: "Relate um problema",
  },
  {
    id: "sugestao",
    label: "Sugestão",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    description: "Proponha melhorias",
  },
  {
    id: "denuncia",
    label: "Denúncia",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    description: "Reporte condutas",
  },
  {
    id: "elogio",
    label: "Elogio",
    icon: <ThumbsUp className="w-5 h-5" />,
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
    description: "Reconheça ações",
  },
]

export const faqItems: FaqItem[] = [
  {
    question: "Quanto tempo leva para receber uma resposta?",
    answer: "O prazo médio é de 5 a 10 dias úteis, dependendo da complexidade. Denúncias urgentes são priorizadas.",
  },
  {
    question: "Posso acompanhar o status da minha manifestação?",
    answer: "Sim! Se informar seu e-mail, você receberá atualizações sobre o andamento do seu caso.",
  },
  {
    question: "Minha identidade será protegida?",
    answer: "Absolutamente. Manifestações anônimas são tratadas com o mesmo cuidado e confidencialidade.",
  },
  {
    question: "Quem tem acesso às informações?",
    answer: "Apenas membros autorizados da gestão do DA, seguindo protocolos rígidos de privacidade.",
  },
]
