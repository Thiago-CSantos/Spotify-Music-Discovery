const express = require('express');
const http = require('http');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
var stateKey = "spotify_auth_state";

//web Socket imports
const io = require('socket.io')(server, { cors: { origin: 'http://localhost:5173' } });

io.on('connection', socket => {
      socket.on('select', (dataToken) => {

            axios.get(`http://localhost:8080/player?accessToken=${dataToken}`)
                  .then((resposta) => {
                        const dados = resposta.data.dados;
                        console.log(dados.progress_ms);
                        // Enviar progresso da musica
                        socket.emit('update', {
                              progress_ms: dados.progress_ms,
                        });

                  }).catch((err) => {
                        console.log('Erro axios: ', err);
                  });

      });
      socket.on('disconnect', (reason) => {
      });

});


// const corsOptions = {
//       credentials: true,
//       origin: 'http://localhost:5173',
// };
app.use(cors());
app.use(cookieParser({
      domain: 'localhost',
}));
app.use(bodyParser.json());


app.get("/testando", (req, res) => {
      console.log(req.headers.device);
      res.send('Testando endpoint HTTP');
});

// Verificador de código - fluxo de autorização PKCE
const generateRandomString = (length) => {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const values = crypto.getRandomValues(new Uint8Array(length));
      return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
const codeVerifier = generateRandomString(64);

// devemos transformá-lo (hash) usando o algoritmo SHA256
// const sha256 = async (plain) => {
//       const encoder = new TextEncoder()
//       const data = encoder.encode(plain)
//       return window.crypto.subtle.digest('SHA-256', data)
// }

// A seguir, implementaremos uma função base64encodeque retorna a base64representação do resumo que acabamos de calcular com a sha256função:
const base64encode = (input) => {
      return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
}

// const hashed = sha256(codeVerifier);
// const codeChallenge = base64encode(hashed);

const clientId = "cab7c6673d954a31828e2f2c616c4c75";
const clientSecret = "5234815092fa4644bebbcfe7b2928e1a";
const redirectUri = "http://localhost:8080/callback";
const scope = "app-remote-control streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state";
const authUrl = new URL("https://accounts.spotify.com/authorize");


app.get("/login", (req, res) => {
      const state = generateRandomString(16);
      res.cookie(stateKey, state);
      const code = req.query.code;
      console.log('Code: ' + code);
      res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
      }));

});
// generated in the previous step
// window.localStorage.setItem('code_verifier', codeVerifier);

app.get("/callback", async (req, res) => {
      console.log('Query: ', req.query);
      const url = 'https://accounts.spotify.com/api/token';
      var code = req.query.code || null;
      var state = req.query.state || null;
      console.log('codeCallback: ' + code);

      const authOptions = {
            method: 'POST',
            headers: {
                  'content-type': 'application/x-www-form-urlencoded',
                  'Authorization': 'Basic ' + (new Buffer.from(clientId + ':' + clientSecret).toString('base64'))
            },
            data: {
                  client_id: clientId,
                  code: code,
                  redirect_uri: redirectUri,
                  grant_type: 'authorization_code',
                  code_verifier: codeVerifier,
            },
            json: true
      };


      const body = await axios.post(url, authOptions.data, { headers: authOptions.headers });
      const token = body.data.access_token;

      console.log(body.data);

      // res.status(200).send(body.data);
      res.redirect(`http://localhost:5173/player?accessToken=${token}`);
      // res.redirect(`http://localhost:5173/redirectDevice?accessToken=${token}`);
      // res.redirect(`/player?accessToken=${token}`);
      // res.redirect(`/track?accessToken=${token}`);
});

app.get("/player", async (req, res) => {
      const token = req.query.accessToken;
      if (token) {

            try {
                  const urlMePlayer = "https://api.spotify.com/v1/me/player";
                  const resposta = await axios.get(urlMePlayer, { headers: { 'Authorization': `Bearer ${token}`, } });
                  const dados = resposta.data;
                  const urlImage = resposta.data.item.album.images[1].url;
                  // const linkOpenImage = `<a href="${urlImage}" target="_blank"><img src="${urlImage}" alt="Descrição da Imagem"></a>`;
                  // res.send(linkOpenImage); é somente para teste
                  res.send({ dados, urlImage });
            } catch (error) {
                  console.log('ERROR: Selecione uma musica ', error);
            }


      }
      else {
            res.status(400).send({ message: 'Token não encontrado na query string.' });
      }
});

app.get("/track", async (req, res) => {
      const token = req.query.accessToken;

      const deviceId = "4ab0faed656eecd4fe239421b5a7005f7b670a80"; // Substitua pelo ID do seu dispositivo
      const trackUri = "spotify:track:48h4dsva3ihxdZ5rkB3IVX"; // Substitua pelo URI da faixa que deseja reproduzir
      await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            uris: [trackUri],
      },
            {
                  headers: { 'Authorization': `Bearer ${token}`, }
            });
});

server.listen(8080, () => console.log('Servidor escutando na porta 8080'));