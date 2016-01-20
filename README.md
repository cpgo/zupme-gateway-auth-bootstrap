# Zup.me oauth: demonstração
Este repositório tem como objetivo demostrar o uso da autenticação oauth fornecida pelo gerenciador de APIs 
[zup.me](https://www.zup.me).

O gerenciador de APIs permite à organização externalizar e proteger seus recursos. A proteção é dada pelo método de
autenticação oauth. A externalização é garantida pelo portal de desenvolvedores que auxilia os developers na construção
de aplicações que consomem os serviços disponibilizados pela organização.

A aplicação do desenvolvedor pode acessar os recursos da organização apenas através de um token de acesso. Tal token é
obtido através de um processo de login fornecido pela organização onde a aplicação se identifica com um appId e pede
permissão para acessar determinados escopos de recursos; e o usuário final informa seu nome de usuário e senha e permite
à aplicação acessar os escopos por ela requisitados.

Neste repositório encontra-se três projetos que demosntram o uso do oauth pela organização e pelo desenvoldor de
aplicações:
  - login-app: aplicação de login oauth da organização; acessada pelas aplicações dos desenvolvedores;
  - lib: bibliotecas de autenticação usadas pelas aplicações que consomem os recursos expostos pela organização;
  - third-party-app: aplicação de desenvolvedor que autentica o usuário via oauth da organização.
  
## Aplicação de login
Localizada no subdiretório app-login, é responsável por tomar como entrada um id de aplicação, escopos e uma url de
callback; autenticar o usuário; autorizar o acesso dos escopos pela aplicação; e devolver um token de acesso para a url
de callback.

### Requisitos
Node, npm e SO compatível (Linux e Mac).

### Instalação
Após baixar o projeto, entre no diretório app-login e execute a seguinte linha de comando.
```
npm install
```

### Execução
É ideal executar a aplicação de login utilizando o próprio Gateway (zup.me) como backend. Para isso altere o valor de
"apiUrl" no arquivo de configuração config/development.json para a url do Gateway. Se preferir, também é possível criar
um arquivo de configuração para um novo ambiente, para isso basta criar outro json de configuração e nomeá-lo como o 
ambiente que ele representa.

Se não for possível utilizar o gateway como backend, suba o servidor de stubby com o seguinte comando:
```
npm run stubby
```
Para executar a aplicação basta rodar o seguinte comando:
```
npm run serve --env development
```
O parâmetro ``-env`` é opcional e sempre que omitido terá o valor padrão de "development".

### Build
Para construir a aplicação de login, gerando arquivos minificados, basta executar:
```
npm run build --env production
```
Para executar a versão de build, utilize o seguinte comando:
```
npm run serve:dist --env production
```

### Namespace no código
O código foi escrito para a companhia fictícia "Company". Na eventual reescrita de código, troque "company" pelo nome
da organização.

## Bibliotecas de autenticação
As bibliotecas de autenticação tem como objetivo facilitar a comunicação entre a aplicação do desenvolvedor e a
aplicação de login oauth da organização. É possível criar bibliotecas para diversas plataformas, nesta demonstração foi
criada apenas a biblioteca para aplicações web, ela se encontra no subdiretório "lib/web".

A biblioteca, após construída, concentra-se num único arquivo: dist/oauth.js. Esse arquivo deve, preferencialmente, ser
distribuído aos desenvolvedores através de um CDN.

Antes de construir a biblioteca, certifique-se de que todos os parâmetros de configuração estão corretos 
(config/development.json). Se preferir, crie mais perfis de build criando novos jsons de configuração, nomeando-os de 
acordo com o ambiente. Veja a seguir a descrição de cada parâmetro:

| Nome                 | Descrição                                                           |
| -------------------- | ------------------------------------------------------------------- |
| oauthUrl             | URL para a aplicação de login                                       |
| popupTitle           | Título da popup de login                                            |
| popupWidth           | Largura da popup de login                                           |
| popupHeight          | Altura da popup de login                                            |
| cookieName           | Nome do cookie para gravar as informações de autenticação           |
| cookieExpirationDays | Número de dias necessários para que o cookie de autenticação expire |

### Funções na biblioteca
A biblioteca implementa as seguintes funções relativas à autenticação:

| Nome                  | Descrição                                                                                 |
|---------------------- | ----------------------------------------------------------------------------------------- |
| login                 | Abre o popup de login                                                                     |
| logout                | Efetua logout, apagando o cookie de autenticação do domínio da aplicação do desenvolvedor |
| consolidateLogin      | Consolida o login, armazenando em cookie os dados da autenticação                         |
| getAuthenticationData | Retorna os dados do usuario logado                                                        |
| isAuthenticated       | Retorna true se o usuário está autenticado e falso em caso contrário                      |
  
O processo de login é construído através de duas funções: "login" e "consolidateLogin". Para abrir o popup de login,
chama-se a função "login" passando como parâmetros o appId, os escopos, a função que deve ser executada em caso de 
sucesso e a url de callback. O login é administrado pela aplicação de login da organização e os dados da autenticação
são transferidos para a url de callback. A única função da página apontada pela url de callback é consolidar o login,
ou seja, gravar as informações de autenticação recebidas num cookie no dominío local, para isso invoca-se a função
"consolidateLogin" da biblioteca.
  
Para mais informações sobre o funcionamento da biblioteca, verifique a documentação no código.

### Requisitos
Node, npm e SO compatível (Linux e Mac).

### Instalação
Após baixar o projeto, entre no diretório app-login e execute a seguinte linha de comando.
```
npm install
```

### Execução
Para servir a biblioteca sem construí-la préviamente (útil para debugging), execute o comando:
```
npm run serve --env development
```
O parâmetro ``-env`` é opcional e sempre que omitido terá o valor padrão de "development".
Lembre-se de incluir no arquivo que importa a biblioteca os arquivos "config.js" e "oauth.js", nesta ordem.

### Build
Para construir o arquivo dist/oauth.js minificado, rode o comando:
```
npm run build --env production
```
Para servir a biblioteca minificada, utilize o comando:
```
npm run serve:dist --env production
```

### Namespace no código
O código foi escrito para a companhia fictícia "Company". Na eventual reescrita de código, troque "company" pelo nome
da organização.

## Aplicação de desenvolvedor
A aplicação de desenvolvedor é aplicação terceira que utiliza os recursos disponibilizados pela organização e para
isso precisa de um token de acesso, fornecido pelo login oauth.

Neste repositório foi implementada uma aplicação simples que apenas loga o usuário e exibe as informações de 
autenticação. A aplicação se encontra no subdiretório "third-party-app".

### Instalação
Após baixar o projeto, entre no diretório app-login e execute a seguinte linha de comando.
```
npm install
```

### Execução
Para executar o projeto, utilize o comando:
```
npm run serve
```

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
Acesse localhost:8082 para visiualizar o third-party-app.