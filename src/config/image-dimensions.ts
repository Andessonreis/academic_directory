/**
 * DIMENSÕES PADRÃO DE IMAGENS DO PROJETO
 * 
 * Ao adicionar imagens, respeite estas proporções para melhor visualização
 */

export const IMAGE_DIMENSIONS = {
  // Eventos - Modal
  events: {
    modal: {
      width: 800,
      height: 600,
      aspectRatio: "4:3",
      description: "Imagem do evento no modal (800x600px ou proporção 4:3)"
    },
    card: {
      width: 400,
      height: 300,
      aspectRatio: "4:3",
      description: "Card do evento no carrossel (400x300px ou proporção 4:3)"
    }
  },

  // Time - Membros
  team: {
    member: {
      width: 400,
      height: 500,
      aspectRatio: "4:5",
      description: "Foto do membro do time (400x500px ou proporção 4:5 - retrato)"
    }
  },

  // Comunidade - Links
  community: {
    icon: {
      width: 64,
      height: 64,
      aspectRatio: "1:1",
      description: "Ícone do tipo de link (64x64px quadrado)"
    }
  },

  // Geral
  general: {
    logo: {
      width: 200,
      height: 200,
      aspectRatio: "1:1",
      description: "Logo quadrado (200x200px)"
    },
    banner: {
      width: 1920,
      height: 1080,
      aspectRatio: "16:9",
      description: "Banner/imagem grande (1920x1080px)"
    }
  }
}

/**
 * RECOMENDAÇÕES TÉCNICAS:
 * 
 * 1. FORMATO: Use WebP para melhor compressão, PNG para transparência, JPG para fotos
 * 2. QUALIDADE: 80-90% de qualidade (bom balanço entre tamanho e qualidade)
 * 3. OTIMIZAÇÃO: Comprima antes de fazer upload
 * 4. PROPORÇÃO: Mantenha a proporção correta para evitar distorção
 * 
 * FERRAMENTAS RECOMENDADAS:
 * - TinyPNG/TinyJPG: https://tinypng.com/
 * - ImageMagick: para resize em lote
 * - Squoosh: https://squoosh.app/ (suporta WebP)
 */
