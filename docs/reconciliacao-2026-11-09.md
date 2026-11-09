# Reconciliação após recuperação do GitHub

Coletor de aquisição GA4 e Search Console dos três produtos, cache e requisição separada para respeitar o limite do Worker. Fonte: publicação Cloudflare 051b9c26-b817-4e4e-9d10-0b4372f866f4. Código modular e cópia de fonte sincronizados para não perder a integração no próximo build. 18 testes passaram.

## Estado e limites

Esta branch recupera trabalho publicado enquanto o GitHub estava indisponível; não é uma publicação nova. As versões acima são comprovadas pelos registros de implantação de 07/11, não uma leitura autenticada atual da Cloudflare. Não restaurar bancos, segredos ou configurações de staging sobre produção. Históricos pessoais, dumps, conversas e credenciais ficam fora do repositório público. Preservar as branches anteriores; não reaplicar PRs antigos sem comparar o conteúdo.

## Consulta ao Claude

Históricos originais consultados em 09/11/2026: Quiddo (links institucionais já entregues), Retrozap Admin (remoção da etapa conferir já entregue), RACKET (rodada 13 e correção preservadas) e SURF (maroleira e quiver já incorporados). Ausência de um commit no GitHub não significa ausência da mudança em produção.

## Worker publicado preservado integralmente

A comparação encontrou funções de funil e correções de pagamento no Worker publicado que não estavam no código modular remoto. Para não descartá-las, src/index.js e fonte/build/worker/index.js preservam o bundle integral da versão 051b9c26, com btw-acquisition.mjs adjacente. A desagregação desses módulos é trabalho posterior: não regenerar o Worker a partir dos módulos remotos antigos. As fontes antigas continuam preservadas no histórico.
