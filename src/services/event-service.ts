import { EventItem } from "@/types/event";

// Aqui estão TODOS os eventos completos.
// No futuro, você vai substituir esse array por uma chamada ao Supabase/Firebase.
const MOCK_DB: EventItem[] = [
  {
    id: 1,
    title: "Hackathon IFBA 2024",
    date: "15 Mar, 2024",
    time: "08:00 - 20:00",
    location: "Laboratórios de Informática",
    category: "Tecnologia",
    categoryColor: "purple",
    description: "Maratona de programação de 12 horas. Prêmios para as 3 melhores equipes.",
    longDescription: "Junte sua equipe e venha resolver problemas reais da nossa comunidade. O Hackathon contará com mentores da indústria, pizza grátis e premiação em dinheiro para os vencedores. É necessário trazer seu próprio notebook e muita disposição para codar.",
    image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=600&auto=format&fit=crop",
    status: "confirmed"
  },
  {
    id: 2,
    title: "Assembleia Geral",
    date: "20 Mar, 2024",
    time: "14:30",
    location: "Sala 105 - Bloco B",
    category: "Reunião",
    categoryColor: "blue",
    description: "Discussão sobre o orçamento anual e pautas trazidas pelos representantes.",
    longDescription: "Esta é a reunião mais importante do semestre. Discutiremos a alocação de verbas para os projetos estudantis, reformas no diretório e a organização da calourada. Sua voz é fundamental para decidir o futuro do nosso campus.",
    status: "confirmed"
  },
  {
    id: 3,
    title: "Cine Debate: IA na Educação",
    date: "05 Abr, 2024",
    time: "18:00",
    location: "Anfiteatro",
    category: "Cultural",
    categoryColor: "pink",
    description: "Exibição de documentário seguido de roda de conversa.",
    longDescription: "Vamos assistir ao documentário 'AlphaGo' e debater os impactos da Inteligência Artificial no processo de aprendizado e no futuro das profissões. O evento contará com a presença de professores convidados da área de filosofia e computação. Pipoca garantida!",
    status: "pending"
  },
  {
    id: 4,
    title: "Campeonato Interclasses",
    date: "12 Abr, 2024",
    time: "10:00",
    location: "Ginásio Poliesportivo",
    category: "Esportes",
    categoryColor: "orange",
    description: "Futsal, Vôlei e Xadrez. Inscreva seu time na sede do D.A.",
    longDescription: "O momento de mostrar quem manda na quadra chegou. As inscrições custam 1kg de alimento não perecível por atleta. Todo o arrecadado será doado para instituições locais. Venha torcer pela sua turma!",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop",
    status: "confirmed"
  },
  {
    id: 5,
    title: "Workshop de Python",
    date: "25 Abr, 2024",
    time: "13:00",
    location: "Lab. Informática 3",
    category: "Acadêmico",
    categoryColor: "green",
    description: "Automação de tarefas simples. Trazer notebook.",
    longDescription: "Aprenda a automatizar planilhas, enviar emails automáticos e fazer web scraping básico. Nível iniciante, não é necessário conhecimento prévio de programação, apenas lógica básica. Vagas limitadas.",
    status: "confirmed"
  }
];

export async function getEvents(): Promise<EventItem[]> {
  // Simula um delay de 500ms para parecer uma requisição real
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_DB;
}
