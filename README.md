# Zup.me oauth: demonstração
Este repositório tem como objetivo demostrar o uso da autenticação oauth fornecida pelo gerenciador de APIs 
[Zup.me](https://www.zup.me).

O gerenciador de APIs permite à organização externalizar e proteger seus recursos. A proteção é dada pelo método de
autenticação oauth. A externalização é garantida pelo portal de desenvolvedores que auxilia os developers na construção
de aplicações que consomem os serviços disponibilizados pela organização.

A aplicação do desenvolvedor pode acessar os recursos da organização apenas através de um token de acesso. Tal token é
obtido através de um processo de login fornecido pela organização onde a aplicação se identifica com um appId e pede
permissão para acessar determinados escopos de recursos; e o usuário final informa seu nome de usuário e senha e permite
à aplicação acessar os escopos por ela requisitados.

Neste repositório encontra-se três projetos que demonstram o uso do oauth pela organização e pelo desenvoldor de
aplicações:

| Path            | Descrição                                                                                                    | Readme                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| login-app       | Aplicação de login oauth da organização; acessada pelas aplicações dos desenvolvedores                       | [README.md](login-app/README.md)       |
| lib             | Bibliotecas de autenticação usadas pelas aplicações dos desenvolvedores que consomem recursos da organização | [README.md](lib/README.md)             |
| third-party-app | Aplicação de desenvolvedor que autentica o usuário via oauth da organização                                  | [README.md](third-party-app/README.md) |
  
## Fluxo oauth

Existem dois fluxos do oauth: completo e implícito; a aplicação de desenvolvedor (terceira) é quem decide o fluxo que
será utilizado. Em resumo, deve-se utilizar o fluxo completo quando existir um servidor backend disponível para a
aplicação e o fluxo implícito em caso contrário.

A diferença entre os dois fluxos está na obtenção do token de acesso (access-token). No fluxo implícito, o token é 
retornado diretamente pela aplicação de login (login-app) através da URL de callback, nenhuma ação adicional é 
necessária por parte da aplicação terceira. No fluxo completo, a aplicação de login da organização retorna apenas um 
"fragmento de token" que não representa o token de acesso completo. A aplicação terceira deve enviar o fragmento para
o backend que o combina com o app-secret (chave privada da aplicação) e requisita do Gateway o access-token final.

Outra diferença importante entre os dois fluxos do oauth é a possibilidade de se renovar um access-token. No fluxo 
completo, é possível renovar o access-token. No fluxo implícito, a renovação de token não é permitida, obrigando o
usuário a efetuar login novamente.

** diagrama do fluxo implícito
** diagrama do fluxo completo

No diagrama, as interações feitas entre os agentes "third-party-app" e "app-login" são implementadas na biblioteca
disponibilizada no diretório lib/web deste repositório. Dessa forma, o desenvolvedor de aplicações terceiras não precisa 
se preocupar com detalhes de implementação do fluxo. No diretório "third-party-app" deste repositório está 
disponibilizado um exemplo de aplicação terceira que utiliza a biblioteca. 

As interações entre os agentes "app-login" e "Gateway" estão implementadas no projeto "app-login" e estão distribuídas
entre duas páginas: "login" e "grant-scopes"; sendo a primeira responsável pela autenticação do usuário e a segunda por
gerenciar os escopos do usuário e da aplicação, decidindo se deve-se ou não pedir ao usuário alguma permissão extra.
Veja a seguir a descrição detalhada de cada atividade entre o app-login e o Gateway.

  - login: autentica o usuário no sistema da organização. Um token é retornado para que se possa autorizar a aplicação e
gerar um access-token ou auth-code. Também é retornado o uid do usuário;
  - getUserScopes: para descobrir se deve-se ou não pedir mais permissões de escopo para usuário, deve-se saber quais
os escopos o usuário já permitiu. Esta atividade retorna todos os escopos já permitidos pelo usuário para a aplicação
terceira;
  - getApplication: esta atividade retorna os dados da aplicação e seus escopos. Esses dados são usados para preencher 
o nome da aplicação e as descrições dos escopos na tela;
  - token: nesta atividade gera-se o access-token ou auth-code dependendo do fluxo (impícito ou completo). Esta 
atividade também retorna as callBackUrls e um grantToken. As callbackUrls são usadas paar verificar se é seguro
redirecionar o usuário para a url de callback fornecida pela aplicação terceira. O grantToken é utilizado para renovar
o grant token usado para a fazer requisisão, já que o mesmo foi invalidado.

## Execução integrada
Para executar os três projetos de forma integrada, rode os seguintes comandos:
```
lib/web$ npm run serve:dist
login-app$ npm run serve:dist
third-party-app$ npm run serve
```
Se você não estiver utilizando o Gateway como backend, rode também o stubby:
```
login-app$ npm run stubby
```
Se você deseja testar o fluxo completo e não possui o backend do third-party-app, rode também o stubby do app terceiro:
```
third-party-app$ npm run stubby
```
Acesse localhost:8082 para visualizar o third-party-app.