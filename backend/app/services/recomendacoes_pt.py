"""Textos das recomendações em português (mesmas chaves de CATALOGO_PADRAO em recomendacoes.py).

Só os textos: categoria, ODS, setores e links ficam no catálogo original.
"""

ENLACES_PT = {
    "/educacion/huella-de-carbono": "Aprenda sobre a pegada de carbono",
    "/educacion/ley-rep": "Aprenda sobre a Lei REP",
    "/educacion/ecosistemas": "Aprenda sobre os ecossistemas",
    "/educacion/empresas-verdes": "Ideias de empresas verdes",
    "/educacion/empresas-b-y-certificaciones": "Conheça as Empresas B e as certificações",
    "/educacion/competitividad": "Sustentabilidade e competitividade",
    "/huella-positiva": "Ir para Empresas que deixam uma pegada positiva",
}

CATALOGO_PT = {
    # ------------------------------------------------------------------ Ambiental
    "q_amb_01": {
        "parametro": "Emissões de gases de efeito estufa",
        "indicador": "Emissões estimadas (t CO₂e) por ano",
        "empieza": {
            "titulo": "Identifique suas fontes de emissões",
            "descricao": "Faça uma lista das atividades que usam eletricidade, combustíveis ou transporte e anote todo mês quanto você consome de acordo com as contas.",
        },
        "avanza": {
            "titulo": "Meça sua pegada de carbono",
            "descricao": "Estime suas emissões uma vez por ano com uma ferramenta oficial, como o programa HuellaChile do Ministério do Meio Ambiente, e defina uma meta de redução.",
        },
    },
    "q_amb_02": {
        "parametro": "Emissões do transporte",
        "indicador": "Litros de combustível ou km percorridos por mês",
        "empieza": {
            "titulo": "Reduza os deslocamentos desnecessários",
            "descricao": "Agrupe entregas e compras, planeje rotas e troque reuniões presenciais por virtuais quando for possível.",
        },
        "avanza": {
            "titulo": "Transporte de menor impacto",
            "descricao": "Avalie veículos mais eficientes ou elétricos e incentive seus trabalhadores a usar bicicleta ou transporte público.",
        },
    },
    "q_amb_03": {
        "parametro": "Consumo de energia",
        "indicador": "kWh por mês e % de redução",
        "empieza": {
            "titulo": "Controle seu consumo de eletricidade",
            "descricao": "Registre todo mês os kWh da conta, desligue luzes e equipamentos que não estão em uso e troque para iluminação LED.",
        },
        "avanza": {
            "titulo": "Eficiência e energias renováveis",
            "descricao": "Defina uma meta anual de economia, prefira equipamentos eficientes ao renová-los e avalie painéis solares ou outras fontes renováveis.",
        },
    },
    "q_amb_04": {
        "parametro": "Consumo de água",
        "indicador": "m³ por mês e % de redução",
        "empieza": {
            "titulo": "Controle seu consumo de água",
            "descricao": "Registre os m³ de cada conta, procure e conserte vazamentos e instale redutores de vazão em torneiras e banheiros.",
        },
        "avanza": {
            "titulo": "Uso eficiente e reaproveitamento da água",
            "descricao": "Defina metas de economia, programe manutenções preventivas e avalie reaproveitar água na rega ou na limpeza.",
        },
    },
    "q_amb_05": {
        "parametro": "Geração de resíduos",
        "indicador": "Kg reciclados / kg totais de resíduos",
        "empieza": {
            "titulo": "Separe seus resíduos",
            "descricao": "Coloque recipientes para papel e papelão, plásticos, vidro e orgânicos, e identifique um ponto de coleta ou reciclador próximo.",
        },
        "avanza": {
            "titulo": "Reduza e registre seus resíduos",
            "descricao": "Registre os quilos que você gera e recicla, entregue-os a gestores autorizados e reduza as embalagens já nas compras.",
        },
    },
    "q_amb_06": {
        "parametro": "Lei REP",
        "indicador": "Verificação de aplicabilidade da Lei REP realizada",
        "empieza": {
            "titulo": "Conheça a Lei REP",
            "descricao": "Informe-se sobre a Lei 20.920 do Chile e verifique se você vende, fabrica ou importa produtos prioritários, como embalagens.",
        },
        "avanza": {
            "titulo": "Verifique se a Lei REP se aplica a você",
            "descricao": "Confirme se sua empresa é considerada «produtora» segundo a lei e, se for o caso, informe-se sobre suas obrigações junto ao Ministério do Meio Ambiente.",
        },
    },
    "q_amb_07": {
        "parametro": "Uso de materiais sustentáveis",
        "indicador": "% de compras com critérios sustentáveis",
        "empieza": {
            "titulo": "Prefira materiais de menor impacto",
            "descricao": "Identifique os 3 insumos que você mais compra e procure alternativas recicladas, reutilizáveis ou biodegradáveis.",
        },
        "avanza": {
            "titulo": "Critérios de compra sustentável",
            "descricao": "Defina critérios ambientais para escolher fornecedores e insumos e compartilhe-os com sua equipe.",
        },
    },
    "q_amb_08": {
        "parametro": "Impacto na biodiversidade",
        "indicador": "Atividades ambientais realizadas por ano",
        "empieza": {
            "titulo": "Conheça seu entorno natural",
            "descricao": "Identifique os ecossistemas próximos à sua empresa (rios, áreas úmidas, florestas, litoral) e como suas atividades poderiam afetá-los.",
        },
        "avanza": {
            "titulo": "Deixe uma pegada positiva",
            "descricao": "Organize com seus trabalhadores um mutirão de limpeza ou um plantio de espécies nativas e registre-o na plataforma.",
        },
    },
    # ------------------------------------------------------------------ Social
    "q_soc_01": {
        "parametro": "Práticas de trabalho seguras",
        "indicador": "Acidentes de trabalho por ano",
        "empieza": {
            "titulo": "Identifique os riscos do seu trabalho",
            "descricao": "Percorra o local de trabalho com sua equipe, anote os riscos e aplique medidas simples (organização, sinalização, equipamentos de proteção). Peça apoio à sua mutual de segurança.",
        },
        "avanza": {
            "titulo": "Formalize a prevenção de riscos",
            "descricao": "Documente os procedimentos de segurança, capacite a equipe e revise os riscos pelo menos uma vez por ano.",
        },
    },
    "q_soc_02": {
        "parametro": "Práticas de trabalho justas e bem-estar",
        "indicador": "% de trabalhadores que conhecem o protocolo",
        "empieza": {
            "titulo": "Crie um protocolo contra o assédio",
            "descricao": "Defina como as denúncias são recebidas e tratadas de forma confidencial, verificando o que a legislação trabalhista vigente exige.",
        },
        "avanza": {
            "titulo": "Divulgue o protocolo e some bem-estar",
            "descricao": "Apresente o protocolo a todos e acrescente ações de bem-estar: pausas ativas, flexibilidade de horário e reconhecimento.",
        },
    },
    "q_soc_03": {
        "parametro": "Direitos trabalhistas",
        "indicador": "% de trabalhadores com contrato e contribuições em dia",
        "empieza": {
            "titulo": "Coloque em dia suas obrigações trabalhistas",
            "descricao": "Verifique se todos têm contrato por escrito, contribuições pagas e jornada e descansos de acordo com a lei. Você pode consultar o órgão do trabalho da sua região.",
        },
        "avanza": {
            "titulo": "Revisão trabalhista periódica",
            "descricao": "Defina uma revisão mensal de contribuições, férias e horas extras.",
        },
    },
    "q_soc_04": {
        "parametro": "Diversidade e inclusão",
        "indicador": "Diferença salarial em cargos semelhantes",
        "empieza": {
            "titulo": "Igualdade de oportunidades",
            "descricao": "Use os mesmos critérios para todos ao contratar e remunerar, e verifique se seus anúncios de vaga não excluem por gênero, idade ou origem.",
        },
        "avanza": {
            "titulo": "Política de inclusão",
            "descricao": "Escreva e comunique seus critérios de igualdade e revise as diferenças salariais entre homens e mulheres em cargos semelhantes.",
        },
    },
    "q_soc_05": {
        "parametro": "Relações com as comunidades locais",
        "indicador": "% de compras de fornecedores locais",
        "empieza": {
            "titulo": "Aproxime-se da sua comunidade",
            "descricao": "Converse com seus vizinhos sobre os efeitos da sua atividade (ruído, trânsito, resíduos) e prefira fornecedores locais.",
        },
        "avanza": {
            "titulo": "Relação permanente com a comunidade",
            "descricao": "Crie um canal de contato com a comunidade e considere a opinião dela antes de fazer mudanças importantes.",
        },
    },
    "q_soc_06": {
        "parametro": "Desenvolvimento comunitário",
        "indicador": "Horas de voluntariado por ano",
        "empieza": {
            "titulo": "Participe de uma iniciativa local",
            "descricao": "Escolha uma causa próxima (associação de moradores, escola, organização social) e apoie-a com tempo, produtos ou conhecimento.",
        },
        "avanza": {
            "titulo": "Planeje sua contribuição para a comunidade",
            "descricao": "Monte um calendário anual de voluntariado ou parcerias e registre cada atividade realizada.",
        },
    },
    "q_soc_07": {
        "parametro": "Educação e capacitação",
        "indicador": "Horas de capacitação por trabalhador por ano",
        "empieza": {
            "titulo": "Capacite sua equipe",
            "descricao": "Identifique as habilidades que sua equipe mais precisa e aproveite cursos gratuitos ou programas públicos de capacitação.",
        },
        "avanza": {
            "titulo": "Plano anual de capacitação",
            "descricao": "Defina temas, responsáveis e datas de capacitação para o ano, e inclua temas de sustentabilidade.",
            "descricao_micro": "Programe pelo menos uma capacitação curta por trimestre e inclua temas de sustentabilidade.",
        },
    },
    # ------------------------------------------------------------------ Econômica
    "q_eco_01": {
        "parametro": "Rentabilidade financeira",
        "indicador": "Margem mensal",
        "empieza": {
            "titulo": "Conheça sua rentabilidade",
            "descricao": "Calcule todo mês suas receitas, custos e margem para saber se o negócio é sustentável ao longo do tempo.",
        },
        "avanza": {
            "titulo": "Meça o retorno do que é sustentável",
            "descricao": "Registre quanto você economiza em energia, água ou materiais graças às suas iniciativas sustentáveis e compare com o que investiu.",
        },
    },
    "q_eco_02": {
        "parametro": "Gestão eficiente dos recursos econômicos",
        "indicador": "% de desvio em relação ao orçamento",
        "empieza": {
            "titulo": "Registre seus gastos",
            "descricao": "Anote todos os seus gastos, separe-os em fixos e variáveis e identifique três que você possa reduzir.",
        },
        "avanza": {
            "titulo": "Orçamento mensal",
            "descricao": "Compare todo mês o orçado com o realizado e corrija os desvios.",
        },
    },
    "q_eco_03": {
        "parametro": "Investimento em inovação e tecnologia",
        "indicador": "Melhorias de processos implementadas por ano",
        "empieza": {
            "titulo": "Encontre oportunidades de melhoria",
            "descricao": "Identifique um processo que consuma muito tempo, energia ou materiais e busque uma solução simples, como digitalizar notas ou controlar o estoque.",
        },
        "avanza": {
            "titulo": "Plano de investimento em eficiência",
            "descricao": "Avalie o custo-benefício de novas tecnologias e pesquise programas públicos de apoio às pequenas empresas.",
        },
    },
    "q_eco_04": {
        "parametro": "Criação de valor compartilhado",
        "indicador": "Iniciativas de valor compartilhado ativas",
        "empieza": {
            "titulo": "Busque benefícios para todos",
            "descricao": "Crie uma iniciativa que ajude o negócio e outras pessoas: comprar de fornecedores locais, descontos pela devolução de embalagens ou benefícios para os trabalhadores.",
        },
        "avanza": {
            "titulo": "Valor compartilhado na sua estratégia",
            "descricao": "Defina metas para suas iniciativas de valor compartilhado e comunique os resultados a clientes e fornecedores.",
        },
    },
    "q_eco_05": {
        "parametro": "Transparência financeira",
        "indicador": "Registros financeiros em dia todo mês",
        "empieza": {
            "titulo": "Organize seus registros financeiros",
            "descricao": "Mantenha notas, faturas e movimentações em dia e separe as contas pessoais das contas da empresa.",
        },
        "avanza": {
            "titulo": "Comunique seus resultados",
            "descricao": "Prepare um relatório periódico simples de resultados para sócios ou trabalhadores.",
            "descricao_micro": "Revise seus números uma vez por mês com seu contador e compartilhe o principal com sua equipe.",
        },
    },
    "q_eco_06": {
        "parametro": "Ética e governança empresarial",
        "indicador": "% de trabalhadores que conhecem as regras da empresa",
        "empieza": {
            "titulo": "Defina regras claras",
            "descricao": "Escreva em uma página como as decisões importantes são tomadas e o que fazer diante de um conflito de interesse.",
        },
        "avanza": {
            "titulo": "Código de ética",
            "descricao": "Formalize suas regras em um código de ética, compartilhe-o com todos e revise-o uma vez por ano.",
            "descricao_micro": "Sua página de regras já é um bom começo: compartilhe-a com toda a equipe e revise-a uma vez por ano.",
        },
    },
    "q_eco_07": {
        "parametro": "Conformidade legal e reclamações",
        "indicador": "% de reclamações resolvidas dentro do prazo",
        "empieza": {
            "titulo": "Coloque em dia suas obrigações legais",
            "descricao": "Faça uma lista das licenças, alvarás, impostos e normas que se aplicam a você, com as datas de vencimento.",
        },
        "avanza": {
            "titulo": "Canal de reclamações",
            "descricao": "Crie um e-mail ou formulário para reclamações, responda dentro de um prazo definido e registre como cada caso foi resolvido.",
        },
    },
}
