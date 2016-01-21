# Aplicação de login
Localizada no subdiretório app-login, é responsável por tomar como entrada um id de aplicação, escopos e uma url de
callback; autenticar o usuário; autorizar o acesso dos escopos pela aplicação; e devolver um token de acesso para a url
de callback.

## Requisitos
Node, npm e SO compatível (Linux e Mac).

## Instalação
Após baixar o projeto, entre no diretório app-login e execute a seguinte linha de comando.
```
npm install
```

## Execução
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

## Build
Para construir a aplicação de login, gerando arquivos minificados, basta executar:
```
npm run build --env production
```
Para executar a versão de build, utilize o seguinte comando:
```
npm run serve:dist --env production
```

## Namespace no código
O código foi escrito para a companhia fictícia "Company". Na eventual reescrita de código, troque "company" pelo nome
da organização.