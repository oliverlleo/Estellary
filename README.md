🚀 Notas de Atualização do Desenvolvedor - Estellary v1.2 🚀
📅 Data: 18 de Junho de 2025
🏗️ Build: v1.2.0-beta
🎯 Foco da Atualização: Balanceamento, Correção de Bugs Críticos e Expansão de Conteúdo (Novo Chefe).

📝 Visão Geral
Esta atualização marca um passo importante para Estellary, focando em enriquecer a experiência de jogo através da implementação de novas mecânicas, correção de bugs críticos que afetavam a jogabilidade e um rebalanceamento geral dos power-ups e encontros com chefes. Agradecemos o feedback contínuo da comunidade, que foi essencial para identificar e priorizar estas mudanças.

🌟 Destaques da Atualização
👹 1. Novo Chefe: Marte, o Conquistador Vermelho
Uma nova ameaça surge no setor! Após derrotar o primeiro guardião, a Terra, os jogadores agora enfrentarão Marte.

Comportamento: Marte se move 20% mais rápido que a Terra e possui um padrão de ataque mais agressivo.

Mecânicas Únicas:

Torretas Acopladas: Duas naves-torreta flutuam ao lado de Marte, disparando projéteis continuamente contra o jogador.

Naves de Laser Laterais: Duas naves independentes surgem nas laterais da tela, carregam um feixe de energia (indicado por um brilho intenso) e disparam um laser horizontal devastador.

✨ 2. Implementação de Power-ups
Dois power-ups que estavam inativos agora foram totalmente implementados, adicionando novas possibilidades estratégicas:

Cadeia de Raios (chain_lightning): Projéteis agora têm a chance de gerar um raio elétrico que salta entre inimigos próximos.

Campo de Repulsão (repulsion_field): Habilidade passiva que emite pulsos automáticos, repelindo asteroides e projéteis inimigos em um raio definido.

🔄 3. Loop Infinito de Jogo (Endgame)
Para aumentar a rejogabilidade, o jogo agora entra em um ciclo contínuo após a primeira vitória contra Marte. A ordem dos desafios é:

Fase de Asteroides

Chefe: Terra

Fase de Asteroides

Chefe: Marte

O ciclo se repete com dificuldade crescente.

⚖️ Balanceamento e Ajustes de Jogabilidade
Para garantir uma curva de dificuldade justa e uma experiência mais dinâmica, foram feitos os seguintes ajustes:

Chefe Marte:
Vida total reduzida em 35%.

Dano dos projéteis das naves-torreta aumentado em 30%.

Dano do feixe de laser aumentado em 30%.

Largura do feixe de laser duplicada para maior impacto visual e desafio.

Física do Jogo:
Implementado sistema de colisão entre asteroides. Eles agora ricocheteiam um no outro de forma realista.

Adicionada colisão entre a nave do jogador e o corpo principal do chefe Marte.

🛠️ Correções de Bugs e Melhorias Visuais
🐛 Bugs Críticos Corrigidos:
Chefe Terra Funcional: A lógica dos satélites do chefe Terra foi totalmente restaurada. As funções createSatellite e updateSatellites, que haviam sido removidas acidentalmente, foram reinseridas, garantindo que o chefe funcione como projetado.

Escudo Reativo (reactive_shield): Corrigido um bug onde o escudo não bloqueava o dano corretamente e não reiniciava após a recarga. Agora, ele bloqueia todo o dano por 2 segundos ao ser ativado pelo primeiro impacto e entra em recarga corretamente.

Física de Projéteis: Os tiros das naves-torreta de Marte agora colidem com o jogador como deveriam.

🎨 Melhorias Visuais (Visual Feedback):
Partículas de Dano: Adicionadas partículas sutis quando a nave do jogador ou os inimigos sofrem dano, melhorando o feedback visual do combate.

Animações de Marte:

As naves-torreta e as naves de laser agora possuem uma leve animação de flutuação vertical.

As naves de laser agora deslizam suavemente para dentro e fora da tela, em vez de aparecerem subitamente.

O feixe de laser agora se origina visivelmente da frente da nave que o dispara.

Orientação de Sprites: Corrigida a orientação da nave de laser da esquerda para que ela aponte para a direita.

🙏 Agradecemos a todos os pilotos pelo apoio contínuo. Continuem explorando e nos enviando seu feedback!

— Equipe de Desenvolvimento Estellary 👨‍🚀
