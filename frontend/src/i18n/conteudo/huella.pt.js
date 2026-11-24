// Tradução para o português de constants/huella.js (mesma ordem das listas).

export const TIPOS_ACTIVIDAD = [
  {
    nombre: 'Limpeza de praias e costas',
    descripcion: 'Recolhimento de resíduos em praias, beira-mar e costas.',
    consejos: [
      'Combine com a prefeitura a retirada dos resíduos recolhidos.',
      'Separe os resíduos recicláveis e pese-os para registrar os quilos.',
      'Não mexa em dunas, ninhos nem áreas com fauna.'
    ],
    llevar: ['luvas', 'sacos resistentes', 'água', 'protetor solar', 'boné']
  },
  {
    nombre: 'Limpeza de rios, canais e áreas úmidas',
    descripcion: 'Retirada de resíduos nas margens de rios, canais e áreas úmidas.',
    consejos: [
      'Trabalhe só nas margens: nunca entre na água sem equipamento e supervisão.',
      'As áreas úmidas são frágeis: caminhe pelas trilhas e evite pisar na vegetação.',
      'Peça autorização à prefeitura ou ao administrador do local.'
    ],
    llevar: ['luvas', 'sacos resistentes', 'botas', 'água', 'repelente']
  },
  {
    nombre: 'Limpeza de florestas, parques e espaços naturais',
    descripcion: 'Recolhimento de resíduos em florestas, morros, parques e trilhas.',
    consejos: [
      'Organize grupos pequenos, cada um com um responsável.',
      'Respeite as trilhas e não retire plantas, pedras nem lenha.',
      'Tenha um plano para emergências e um kit de primeiros socorros.'
    ],
    llevar: ['luvas', 'sacos', 'calçado fechado', 'água', 'kit de primeiros socorros']
  },
  {
    nombre: 'Reflorestamento com árvores nativas',
    descripcion: 'Plantio de árvores e arbustos nativos em espaços autorizados.',
    consejos: [
      'Use sempre espécies nativas adequadas à sua região.',
      'Consiga as mudas em viveiros ou programas oficiais de arborização.',
      'Planeje a rega e o cuidado das árvores depois do plantio.'
    ],
    llevar: ['luvas', 'pás', 'água para rega', 'roupa confortável']
  },
  {
    nombre: 'Recuperação de áreas verdes',
    descripcion: 'Recuperação e manutenção de praças, jardins e espaços comunitários.',
    consejos: [
      'Escolha o espaço junto com os vizinhos ou a associação de moradores.',
      'Registre como o lugar estava antes e como ficou depois.',
      'Combine quem vai cuidar do espaço ao longo do tempo.'
    ],
    llevar: ['luvas', 'ferramentas de jardinagem', 'água', 'roupa de trabalho']
  },
  {
    nombre: 'Campanha de reciclagem',
    descripcion: 'Coleta de resíduos recicláveis na empresa ou na comunidade.',
    consejos: [
      'Combine antes com um reciclador ou ponto de coleta quais materiais ele recebe.',
      'Avise com antecedência o que trazer e como entregar limpo e separado.',
      'Pese o que foi coletado para registrar os quilos.'
    ],
    llevar: ['materiais recicláveis limpos e separados']
  },
  {
    nombre: 'Educação ambiental',
    descripcion: 'Palestras, oficinas ou visitas guiadas sobre o cuidado com o meio ambiente.',
    consejos: [
      'Convide uma organização ambiental ou um especialista local.',
      'Relacione o tema com o trabalho diário da empresa.',
      'Você pode abrir a atividade para as famílias dos funcionários.'
    ],
    llevar: ['vontade de aprender']
  },
  {
    nombre: 'Voluntariado em conservação',
    descripcion: 'Apoio a projetos de conservação da flora e da fauna locais.',
    consejos: [
      'Procure organizações ou áreas protegidas que recebam voluntários.',
      'Siga sempre as instruções dos responsáveis pelo local.',
      'Registre as horas de voluntariado de cada jornada.'
    ],
    llevar: ['roupa confortável', 'água', 'proteção solar']
  },
  {
    nombre: 'Outra atividade',
    descripcion: 'Qualquer outra ação positiva para a natureza ou a comunidade.'
  }
]

export const FECHAS_AMBIENTALES = [
  { nombre: 'Dia da Educação Ambiental', sugerencia: 'Organize uma palestra curta sobre o cuidado com o meio ambiente na sua empresa.' },
  { nombre: 'Dia Mundial da Redução de CO₂', sugerencia: 'Revise com sua equipe o consumo de energia e combustível e proponham uma meta de redução.' },
  { nombre: 'Dia Mundial das Zonas Úmidas', sugerencia: 'Organize uma limpeza em uma área úmida ou na margem de um rio próximo.' },
  { nombre: 'Dia Mundial das Baleias', sugerencia: 'Mostre à sua equipe como os resíduos plásticos chegam ao oceano e afetam a fauna marinha.' },
  { nombre: 'Dia Internacional dos Catadores de Materiais Recicláveis', sugerencia: 'Organize uma campanha de reciclagem junto com um catador da sua cidade.' },
  { nombre: 'Dia Mundial da Vida Selvagem', sugerencia: 'Participe de um voluntariado de conservação em um espaço natural.' },
  { nombre: 'Dia Internacional das Florestas', sugerencia: 'Plante árvores nativas ou limpe uma floresta ou parque próximo.' },
  { nombre: 'Dia Mundial da Água', sugerencia: 'Limpe a margem de um rio ou canal e verifique os vazamentos de água na sua empresa.' },
  { nombre: 'Dia Mundial do Clima', sugerencia: 'Faça uma oficina sobre a pegada de carbono da sua empresa.' },
  { nombre: 'Dia da Terra', sugerencia: 'Recupere uma área verde do seu bairro junto com seus funcionários.' },
  { nombre: 'Dia Mundial dos Pinguins', sugerencia: 'Organize uma limpeza de praia ou costa.' },
  { nombre: 'Dia Mundial das Aves Migratórias', sugerencia: 'Limpe uma área úmida, lugar de descanso de muitas aves migratórias.' },
  { nombre: 'Dia Internacional da Reciclagem', sugerencia: 'Lance uma campanha de reciclagem na sua empresa e com seus clientes.' },
  { nombre: 'Dia Internacional da Diversidade Biológica', sugerencia: 'Apoie um projeto de conservação da flora ou da fauna local.' },
  { nombre: 'Dia Mundial da Bicicleta', sugerencia: 'Convide sua equipe a vir de bicicleta e conversem sobre transporte sustentável.' },
  { nombre: 'Dia Mundial do Meio Ambiente', sugerencia: 'Faça uma jornada ambiental com seus funcionários e suas famílias.' },
  { nombre: 'Dia Mundial dos Oceanos', sugerencia: 'Organize uma limpeza de praia com sua equipe.' },
  { nombre: 'Dia Mundial das Tartarugas Marinhas', sugerencia: 'Limpe uma praia: os plásticos são uma das principais ameaças às tartarugas.' },
  { nombre: 'Dia Mundial de Combate à Desertificação e à Seca', sugerencia: 'Plante espécies nativas resistentes à seca.' },
  { nombre: 'Dia Mundial da Árvore', sugerencia: 'Organize um plantio de árvores nativas.' },
  { nombre: 'Dia Internacional Livre de Sacolas Plásticas', sugerencia: 'Elimine as sacolas plásticas na sua empresa e distribua sacolas reutilizáveis.' },
  { nombre: 'Dia Internacional dos Guarda-Parques', sugerencia: 'Visite uma área protegida e apoie suas atividades de voluntariado.' },
  { nombre: 'Dia Internacional do Huemul', sugerencia: 'Conheça com sua equipe as espécies nativas ameaçadas do Chile.' },
  { nombre: 'Dia Internacional dos Parques Nacionais', sugerencia: 'Organize uma visita ou um voluntariado em um parque nacional.' },
  { nombre: 'Dia Mundial das Aves Limícolas', sugerencia: 'Limpe uma costa ou área úmida costeira respeitando as zonas de aves.' },
  { nombre: 'Dia Internacional para a Preservação da Camada de Ozônio', sugerencia: 'Revise os equipamentos de refrigeração e climatização da sua empresa.' },
  { nombre: 'Dia de Limpeza de Praias e Costas', sugerencia: 'Participe da jornada de limpeza de praias com sua equipe.' },
  { nombre: 'Dia Mundial Sem Carro', sugerencia: 'Convide sua equipe a vir a pé, de bicicleta ou de transporte público.' },
  { nombre: 'Dia Nacional do Meio Ambiente (Chile)', sugerencia: 'Comemore com uma jornada de recuperação de um espaço natural da sua cidade.' },
  { nombre: 'Dia Mundial do Habitat', sugerencia: 'Melhore um espaço comunitário do seu bairro.' },
  { nombre: 'Dia de Proteção da Natureza', sugerencia: 'Participe de um voluntariado de conservação.' },
  { nombre: 'Dia Mundial da Economia de Energia', sugerencia: 'Percorra a empresa para encontrar equipamentos e luzes ligados sem uso.' },
  { nombre: 'Dia Internacional contra as Mudanças Climáticas', sugerencia: 'Compartilhe com sua equipe as ações da empresa para reduzir suas emissões.' },
  { nombre: 'Dia da Fauna Chilena', sugerencia: 'Apoie um projeto de proteção da fauna nativa.' },
  { nombre: 'Dia Nacional das Áreas Protegidas (Chile)', sugerencia: 'Visite uma área protegida com sua equipe e apoie seu cuidado.' },
  { nombre: 'Dia Mundial do Solo', sugerencia: 'Comece uma composteira com os resíduos orgânicos da empresa.' },
  { nombre: 'Dia Internacional das Montanhas', sugerencia: 'Limpe uma trilha ou morro próximo.' },
  { nombre: 'Aniversário do Acordo de Paris', sugerencia: 'Revise o progresso da sua empresa na redução de emissões.' }
]
