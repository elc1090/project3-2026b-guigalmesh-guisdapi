// Tradução para o português de constants/educacion.js (mesma ordem dos temas e dos itens).
// Os nomes das fontes oficiais continuam em espanhol: são órgãos e programas do Chile.

export const TEMAS = [
  // 1
  {
    titulo: 'A sustentabilidade e suas três dimensões',
    resumen: 'O que significa ser uma empresa sustentável e como avançar passo a passo.',
    intro:
      'Ser sustentável não significa apenas cuidar do meio ambiente. Também significa se preocupar com as pessoas, usar com responsabilidade os recursos econômicos e contribuir para o bem-estar das comunidades e do planeta. Por isso a sustentabilidade de uma empresa é vista em três dimensões.',
    bloques: [
      {
        titulo: 'Dimensão ambiental',
        texto:
          'Busca usar com responsabilidade os recursos naturais, reduzir os resíduos e prevenir os impactos negativos gerados pela atividade da empresa.',
        ejemplo:
          'Uma PME revisa todo mês as contas de luz e água, troca a iluminação por LED e coloca recipientes para separar papel e papelão.'
      },
      {
        titulo: 'Dimensão social',
        texto:
          'Considera o bem-estar dos trabalhadores, a igualdade de oportunidades, a segurança no trabalho e a relação da empresa com sua comunidade.',
        ejemplo:
          'Uma PME organiza reuniões mensais para ouvir seus trabalhadores, revisar as condições de segurança e identificar melhorias no ambiente de trabalho.'
      },
      {
        titulo: 'Dimensão econômica',
        texto:
          'Busca que a empresa seja viável ao longo do tempo, use seus recursos com eficiência e tome decisões que favoreçam sua continuidade. Também inclui a ética e a governança: como as decisões são tomadas, como as obrigações são cumpridas e como se mantém a confiança de trabalhadores, clientes e fornecedores.',
        ejemplo:
          'Uma PME registra todo mês suas vendas, gastos e estoque. Com essas informações identifica produtos com pouca saída e ajusta suas compras para reduzir perdas.'
      }
    ],
    pasos: [
      { nombre: 'Avalie', texto: 'responda o diagnóstico de sustentabilidade da plataforma.' },
      { nombre: 'Identifique', texto: 'veja quais dimensões têm mais oportunidades de melhoria.' },
      { nombre: 'Priorize', texto: 'escolha duas ou três ações importantes e viáveis para sua empresa.' },
      { nombre: 'Implemente', texto: 'defina responsáveis, recursos e prazos.' },
      { nombre: 'Meça', texto: 'use indicadores para acompanhar seu progresso.' },
      { nombre: 'Melhore', texto: 'revise os resultados e ajuste as ações quando for necessário.' }
    ],
    nota:
      'A sustentabilidade não exige mudar a empresa inteira de um dia para o outro. Comece com ações pequenas, mensuráveis e constantes: pequenas ações, grandes mudanças.'
  },

  // 2
  {
    titulo: 'Agenda 2030 e os ODS',
    resumen: 'Os 17 Objetivos de Desenvolvimento Sustentável e como sua empresa pode contribuir com eles.',
    intro:
      'A Agenda 2030 para o Desenvolvimento Sustentável é um plano de ação adotado em 2015 pelos países-membros das Nações Unidas, entre eles o Chile e o Brasil. Reúne 17 Objetivos de Desenvolvimento Sustentável (ODS) com 169 metas. As empresas, mesmo as menores, podem contribuir com ações concretas na gestão do dia a dia. Cada recomendação do seu diagnóstico indica para quais ODS ela contribui.'
  },

  // 3
  {
    titulo: 'Pegada de carbono',
    resumen: 'O que é, por que medir e como reduzir as emissões da sua empresa.',
    intro:
      'A pegada de carbono é a quantidade de gases de efeito estufa (GEE) emitida por uma organização, um produto ou uma atividade. É expressa em toneladas de CO₂ equivalente (t CO₂e). Esses gases são a principal causa das mudanças climáticas.',
    bloques: [
      {
        titulo: 'Por que medir?',
        items: [
          'Mostra onde se concentram seus consumos de energia e combustível, que também são custos.',
          'Permite definir metas de redução e verificar se você está avançando.',
          'Cada vez mais clientes, grandes empresas e licitações valorizam as empresas que gerenciam suas emissões.',
          'É uma forma concreta de contribuir para o ODS 13: Ação contra a mudança global do clima.'
        ]
      },
      {
        titulo: 'De onde vêm as emissões de uma PME?',
        items: [
          'Combustíveis usados pela própria empresa: veículos, caldeiras, geradores, gás.',
          'Eletricidade comprada pela empresa.',
          'Outras fontes: transporte dos fornecedores, viagens de trabalho, deslocamento dos trabalhadores e resíduos enviados para descarte.'
        ]
      },
      {
        titulo: 'Como reduzir?',
        items: [
          'Reduzir o consumo de eletricidade.',
          'Melhorar a eficiência dos equipamentos e fazer manutenção.',
          'Preferir meios de transporte menos poluentes.',
          'Reduzir deslocamentos desnecessários e planejar rotas.',
          'Usar energias renováveis quando for possível.'
        ]
      },
      {
        titulo: 'Programa HuellaChile',
        texto:
          'Programa do Ministério do Meio Ambiente do Chile que incentiva o cálculo, o relato e a gestão dos gases de efeito estufa em organizações públicas e privadas. Oferece uma calculadora gratuita e reconhece com selos as organizações que quantificam e reduzem suas emissões. A inscrição é feita na Ventanilla Única do Ministério, com a ClaveÚnica.'
      }
    ],
    acciones: {
      titulo: 'Por onde começar?',
      items: [
        'Junte as contas de eletricidade e as compras de combustível dos últimos 12 meses.',
        'Anote os quilômetros percorridos pelos veículos da empresa.',
        'Calcule sua pegada com uma ferramenta oficial, como a calculadora do HuellaChile.',
        'Escolha uma ou duas medidas de redução e repita a medição todo ano para ver seu progresso.'
      ]
    }
  },

  // 4
  {
    titulo: 'Lei REP',
    resumen: 'A Lei 20.920 de Responsabilidade Estendida do Produtor e a gestão de resíduos.',
    intro:
      'A Lei 20.920 do Chile, conhecida como Lei REP ou Lei da Reciclagem, estabelece a Responsabilidade Estendida do Produtor: as empresas que colocam certos produtos no mercado devem organizar e financiar a gestão dos seus resíduos quando chegam ao fim da vida útil. Gerenciar bem os resíduos faz parte de uma atividade empresarial responsável.',
    bloques: [
      {
        titulo: 'Produtos prioritários',
        texto: 'A lei define seis produtos prioritários. Cada um tem suas próprias metas de coleta e valorização, fixadas por decreto:',
        items: [
          'Embalagens',
          'Pneus',
          'Óleos lubrificantes',
          'Aparelhos elétricos e eletrônicos',
          'Pilhas',
          'Baterias'
        ],
        dato: 'Em 2025 o Ministério do Meio Ambiente também declarou os têxteis como produto prioritário.'
      },
      {
        titulo: 'Quem é o «produtor»?',
        texto:
          'É quem coloca um produto prioritário no mercado nacional pela primeira vez: por exemplo, quem o fabrica ou embala e vende com sua marca, ou quem o importa. Uma PME que importa produtos embalados também pode ser produtora de embalagens.'
      },
      {
        titulo: 'Obrigações do produtor',
        items: [
          'Inscrever-se no registro de produtores do Ministério do Meio Ambiente.',
          'Organizar e financiar a gestão dos resíduos dos seus produtos.',
          'Cumprir metas de coleta e valorização, individualmente ou por meio de um sistema de gestão coletivo.'
        ]
      },
      {
        titulo: 'Se sua empresa não é produtora',
        texto: 'Mesmo assim você pode contribuir com uma boa gestão dos seus resíduos:',
        items: [
          'Separe e classifique os resíduos na sua empresa.',
          'Entregue-os em pontos de coleta ou a gestores e recicladores autorizados.',
          'Prefira fornecedores com embalagens recicláveis ou retornáveis.',
          'Reduza as embalagens que você compra e usa.'
        ]
      },
      {
        titulo: 'O melhor resíduo é aquele que não é gerado',
        texto: 'Antes de reciclar, pense nesta ordem:',
        items: [
          'Reduzir: comprar e usar só o necessário.',
          'Reutilizar: usar de novo embalagens, caixas e materiais.',
          'Reciclar: transformar o resíduo em matéria-prima.',
          'Valorizar: aproveitar o resíduo de outra forma, por exemplo como energia.'
        ]
      }
    ],
    acciones: {
      titulo: 'Para sua PME',
      items: [
        'Verifique se você fabrica, embala ou importa algum dos produtos prioritários.',
        'Se for o caso, consulte suas obrigações nas fontes oficiais do Ministério.',
        'Organize a separação de resíduos e registre os quilos que você recicla.'
      ]
    },
    nota:
      'As obrigações e metas dependem do decreto de cada produto prioritário. Em caso de dúvida, consulte sempre as fontes oficiais.'
  },

  // 5
  {
    titulo: 'Empresas B e certificações',
    resumen: 'O que é uma Empresa B, quais certificações existem e como começar.',
    intro:
      'As certificações de sustentabilidade são ferramentas voluntárias que reconhecem as empresas que gerenciam seu impacto social e ambiental, além dos resultados econômicos. Nenhuma empresa é obrigada a se certificar, mas conhecê-las ajuda a organizar o caminho.',
    bloques: [
      {
        titulo: 'O que é uma Empresa B?',
        texto:
          'É uma empresa que busca gerar um impacto positivo nas pessoas e no meio ambiente, além do lucro (o chamado «triplo impacto»). Sua avaliação considera os trabalhadores, a comunidade, os clientes, o meio ambiente e a governança. No Chile ela é promovida pelo Sistema B.'
      },
      {
        titulo: 'Como uma Empresa B é certificada?',
        items: [
          'Responder a Avaliação de Impacto B, que é gratuita.',
          'Obter pelo menos 80 pontos nessa avaliação.',
          'Passar pelo processo de verificação.',
          'Alterar o estatuto para considerar todos os seus grupos de interesse.',
          'A certificação dura três anos e o custo depende do porte da empresa. Não há porte mínimo para se certificar.'
        ]
      },
      {
        titulo: 'Acordos de Produção Limpa (APL)',
        texto:
          'São convênios voluntários entre um setor produtivo, suas empresas e órgãos públicos, com metas concretas de sustentabilidade. No Chile são coordenados pela Agencia de Sustentabilidad y Cambio Climático (ASCC), com ênfase nas PMEs. Ao cumprir as metas, as instalações recebem uma certificação de cumprimento.'
      },
      {
        titulo: 'Outras ferramentas',
        items: [
          'Selos HuellaChile: reconhecem a medição e a redução da pegada de carbono.',
          'ISO 14001: norma internacional para sistemas de gestão ambiental, certificada por organismos independentes.'
        ]
      },
      {
        titulo: 'Benefícios de uma gestão responsável',
        items: [
          'Gera confiança em clientes, fornecedores e investidores.',
          'Diferencia a empresa da concorrência.',
          'Ajuda a atrair e manter bons trabalhadores.',
          'Abre portas em cadeias de fornecimento e licitações que pedem critérios de sustentabilidade.'
        ]
      }
    ],
    acciones: {
      titulo: 'Primeiros passos para sua PME',
      items: [
        'Responda o diagnóstico desta plataforma e trabalhe no seu plano de ação.',
        'Faça a Avaliação de Impacto B como autoavaliação, mesmo que ainda não queira se certificar.',
        'Pergunte à sua associação setorial se existe um Acordo de Produção Limpa para o seu setor.',
        'Meça sua pegada de carbono com o HuellaChile.'
      ]
    },
    nota:
      'Obter uma certificação exige cumprir requisitos específicos e, em alguns casos, pagar custos de verificação. Nem todas as empresas são obrigadas a se certificar.'
  },

  // 6
  {
    titulo: 'Empresas verdes',
    resumen: 'Ideias concretas para transformar seu negócio aos poucos.',
    intro:
      'Uma empresa verde é uma organização que busca reduzir seu impacto ambiental com ações concretas. Não é preciso fazer tudo de uma vez: qualquer PME pode avançar passo a passo.',
    bloques: [
      {
        titulo: 'O que faz uma empresa verde?',
        items: [
          'Usa energias renováveis.',
          'Reduz e recicla seus resíduos.',
          'Economiza água e eletricidade.',
          'Usa materiais mais sustentáveis.',
          'Implementa processos produtivos mais limpos.',
          'Reduz a poluição.',
          'Protege os recursos naturais.'
        ]
      },
      {
        titulo: 'Ideias para o seu ramo',
        items: [
          'Comércio: sacolas reutilizáveis, embalagens retornáveis e menos embalagem.',
          'Turismo e gastronomia: compostagem dos resíduos orgânicos e economia de água.',
          'Indústria: reaproveitar retalhos e sobras, e fazer manutenção dos equipamentos.',
          'Serviços e tecnologia: documentos digitais e reciclagem de equipamentos eletrônicos.',
          'Construção: separar entulho e reutilizar materiais.',
          'Agricultura: irrigação eficiente e proteção do solo.'
        ]
      },
      {
        titulo: 'Comunique sem exagerar',
        texto:
          'Conte aos seus clientes o que você realmente faz, com dados concretos. Evite frases como «100 % ecológico» se não puder comprová-las: essa prática é conhecida como «greenwashing» e prejudica a confiança.'
      }
    ],
    pasos: [
      { nombre: 'Meça', texto: 'revise suas contas de luz e água e observe quais resíduos você gera.' },
      { nombre: 'Economize', texto: 'aplique medidas sem custo: desligar equipamentos, consertar vazamentos, separar resíduos.' },
      { nombre: 'Invista', texto: 'quando puder, troque para iluminação LED, equipamentos eficientes ou energias renováveis.' },
      { nombre: 'Comunique', texto: 'compartilhe seu progresso com clientes e trabalhadores.' }
    ]
  },

  // 7
  {
    titulo: 'Ecossistemas e natureza',
    resumen: 'Por que os ecossistemas são importantes e como sua empresa pode protegê-los.',
    intro:
      'Os ecossistemas nos fornecem alimentos, água, matérias-primas e outros recursos fundamentais para a nossa sobrevivência. Cuidar da natureza também significa cuidar da nossa qualidade de vida e do futuro das próximas gerações.',
    bloques: [
      { titulo: 'Florestas', texto: 'Ajudam a capturar carbono, produzir oxigênio e proteger o solo.' },
      { titulo: 'Áreas úmidas', texto: 'Contribuem para regular a água e servem de refúgio para inúmeras espécies.' },
      { titulo: 'Rios e lagos', texto: 'Fornecem água doce e permitem a vida de muitos organismos.' },
      { titulo: 'Oceanos', texto: 'Regulam o clima e abrigam uma enorme biodiversidade.' },
      {
        titulo: 'Como uma empresa pode afetá-los?',
        items: [
          'Resíduos descartados de forma inadequada que chegam a rios, praias ou florestas.',
          'Uso excessivo de água ou descarte de efluentes contaminados.',
          'Intervenção no solo e na vegetação nativa.',
          'Ruído e luz que perturbam a fauna.'
        ]
      },
      {
        titulo: 'Ir além: deixar uma pegada positiva',
        texto: 'Além de reduzir seus impactos, as empresas podem participar ativamente da proteção e da recuperação da natureza:',
        items: [
          'Mutirões de limpeza de praias, rios, canais e áreas úmidas.',
          'Recolhimento de resíduos em florestas, parques e espaços naturais.',
          'Reflorestamento e plantio de árvores nativas.',
          'Recuperação e manutenção de áreas verdes.',
          'Educação ambiental e voluntariado em projetos de conservação.'
        ]
      }
    ],
    nota:
      'As atividades em espaços naturais devem ser feitas com segurança, com autorização quando necessário e seguindo as recomendações das autoridades ambientais. No reflorestamento, prefira sempre espécies nativas.'
  },

  // 8
  {
    titulo: 'Sustentabilidade e competitividade',
    resumen: 'Como a sustentabilidade se torna valor agregado e vantagem para o seu negócio.',
    intro:
      'A sustentabilidade não é um gasto desnecessário nem uma moda: é uma oportunidade para melhorar o negócio, reduzir custos, gerar valor para as pessoas e ser mais competitivo.',
    bloques: [
      {
        titulo: 'Um valor agregado para o seu negócio',
        texto: 'Uma empresa que reduz seus resíduos, cuida dos seus trabalhadores e trabalha com responsabilidade pode:',
        items: [
          'Melhorar sua imagem.',
          'Gerar confiança nos clientes.',
          'Diferenciar-se de outras empresas.',
          'Atrair consumidores que valorizam a sustentabilidade.',
          'Fortalecer sua reputação.',
          'Gerar novas oportunidades comerciais.'
        ]
      },
      {
        titulo: 'Uma empresa mais competitiva',
        items: [
          'Reduz custos graças à economia de água e eletricidade.',
          'Atrai novos clientes e acessa novas oportunidades de negócio.',
          'Melhora a relação com fornecedores e clientes.',
          'Adapta-se às novas exigências do mercado.',
          'Inova e melhora seus processos produtivos.'
        ]
      },
      {
        titulo: 'Exemplo',
        texto:
          'Uma padaria troca a iluminação por LED, conserta os vazamentos de água e separa o papelão para reciclagem. Suas contas diminuem todo mês e, ao contar isso nas redes sociais, atrai clientes que valorizam essas práticas.'
      }
    ],
    acciones: {
      titulo: 'Para sua PME',
      items: [
        'Registre quanto você economiza com cada medida sustentável: é a melhor forma de mostrar que vale a pena.',
        'Identifique o que seus clientes valorizam e comunique seu progresso com dados reais.',
        'Verifique se seus clientes maiores pedem critérios de sustentabilidade aos fornecedores.'
      ]
    }
  }
]
