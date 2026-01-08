# ToDoES – Comparação Arquitetural entre MVC, MVP e MVVM

Este repositório apresenta a implementação e a análise comparativa das arquiteturas de frontend MVC, MVP e MVVM aplicadas a um mesmo aplicativo ToDo, desenvolvido em React com TypeScript e integrado a um backend implementado na plataforma Supabase.

O backend foi explorado em dois modelos distintos: REST tradicional e reativo (event-driven). A análise é baseada nas decisões de projeto adotadas, nas dificuldades encontradas durante a implementação e nas consequências práticas observadas no código, conforme proposto no enunciado do trabalho.

---

## Objetivo do Projeto

O objetivo deste projeto é realizar uma comparação crítica entre as arquiteturas MVC, MVP e MVVM, considerando:

- Organização e clareza do código
- Gerenciamento de estado
- Grau de acoplamento entre camadas
- Facilidade de integração com backends REST e reativos
- Adequação de cada arquitetura para sistemas de maior porte

A avaliação prioriza evidências práticas obtidas durante a implementação, e não apenas definições conceituais.

---

## Arquiteturas Avaliadas

### MVC (Model–View–Controller)

Na implementação utilizando MVC, a maior parte da lógica concentrou-se nos Controllers, que passaram a acumular chamadas ao Supabase, tratamento de eventos e controle de estado. Na prática, isso gerou forte acoplamento com a View e duplicação de lógica, evidenciando que o MVC se torna artificial e pouco coeso no contexto do React.

### MVP (Model–View–Presenter)

Na arquitetura MVP, a lógica principal foi deslocada para o Presenter, centralizando o fluxo entre a View e o backend e reduzindo o acoplamento direto da interface. Contudo, a implementação revelou aumento de verbosidade e crescimento progressivo da complexidade do Presenter à medida que o código evoluía.

### MVVM (Model–View–ViewModel)

No MVVM, a lógica ficou concentrada no ViewModel, responsável por gerenciar o estado da aplicação e sua sincronização com o Supabase. Essa abordagem apresentou fluxo de dados mais previsível, menor duplicação de lógica e melhor alinhamento com o modelo reativo do React, especialmente ao utilizar backend reativo.

---

## Integração com Backend Reativo

A integração com o backend reativo evidenciou diferenças significativas entre as arquiteturas.

No MVVM, a integração foi a mais direta, pois o ViewModel já centralizava o estado da aplicação. Os eventos automáticos recebidos do Supabase puderam ser incorporados diretamente ao estado, eliminando a necessidade de requisições adicionais ou lógica manual de sincronização.

No MVP, a integração exigiu que o Presenter assumisse explicitamente o gerenciamento das subscriptions do backend reativo. Embora funcional, essa abordagem aumentou a complexidade do Presenter, que passou a acumular responsabilidades relacionadas ao fluxo de dados e ao ciclo de vida das conexões reativas.

No MVC, a integração mostrou-se a menos eficiente. Os Controllers passaram a concentrar lógica de escuta de eventos, atualização do Model e notificação da View, agravando o acoplamento entre as camadas.

---

## Impactos da Troca de REST por Reativo no Frontend

A substituição do backend REST por um backend reativo impactou diretamente o gerenciamento de estado no frontend. No modelo REST, as atualizações dependiam de requisições explícitas. Com o backend reativo, as atualizações passaram a ocorrer de forma automática, exigindo que o frontend lidasse com eventos assíncronos contínuos.

Essa mudança expôs fragilidades arquiteturais, principalmente no MVC e no MVP, que não centralizam o estado da aplicação. Nessas arquiteturas, foi necessário introduzir lógica adicional para evitar inconsistências visuais e estados duplicados.

No MVVM, o impacto foi significativamente menor, pois o ViewModel já funcionava como fonte única de verdade, demonstrando maior adequação para aplicações integradas a backends reativos.

---

## Arquitetura Recomendada para Sistemas Maiores

Com base na experiência prática obtida durante a implementação, a arquitetura MVVM mostrou-se a mais adequada para sistemas de maior porte. Sua separação clara entre View e ViewModel reduziu o acoplamento, facilitou a introdução de novas funcionalidades e tornou o código mais resiliente a mudanças no backend.

O MVP, apesar de mais organizado que o MVC, apresentou crescimento rápido da complexidade do Presenter, indicando risco de se tornar um novo ponto de acoplamento em sistemas maiores. O MVC, por sua vez, demonstrou limitações estruturais relevantes no contexto do React, dificultando a manutenção e a integração com arquiteturas reativas.

---

## Conclusão

A implementação prática das três arquiteturas evidenciou que decisões arquiteturais impactam diretamente a clareza do código, o gerenciamento de estado e a facilidade de manutenção. A experiência demonstrou que abordagens excessivamente teóricas, como o MVC aplicado ao React, tendem a gerar acoplamentos artificiais.

Por outro lado, arquiteturas alinhadas ao paradigma reativo e orientadas a estado, como o MVVM, mostraram-se mais adequadas para aplicações modernas, especialmente quando combinadas a backends event-driven. Assim, o trabalho reforça que a escolha arquitetural deve ser guiada não apenas por definições conceituais, mas principalmente por evidências práticas obtidas durante a implementação.

---

## Autores

Projeto desenvolvido por:
- Cauan Galdino  
- Melissa Guedes  
- Bianca Oliveira
