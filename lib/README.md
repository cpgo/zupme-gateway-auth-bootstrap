# Bibliotecas de autenticação
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

## Funções na biblioteca
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

## Requisitos
Node, npm e SO compatível (Linux e Mac).

## Instalação
Após baixar o projeto, entre no diretório app-login e execute a seguinte linha de comando.
```
npm install
```

## Execução
Para servir a biblioteca sem construí-la préviamente (útil para debugging), execute o comando:
```
npm run serve --env development
```
O parâmetro ``-env`` é opcional e sempre que omitido terá o valor padrão de "development".
Lembre-se de incluir no arquivo que importa a biblioteca os arquivos "config.js" e "oauth.js", nesta ordem.

## Build
Para construir o arquivo dist/oauth.js minificado, rode o comando:
```
npm run build --env production
```
Para servir a biblioteca minificada, utilize o comando:
```
npm run serve:dist --env production
```

## Namespace no código
O código foi escrito para a companhia fictícia "Company". Na eventual reescrita de código, troque "company" pelo nome
da organização.