# GraphDeck

## Development

Serve data files from other directory:
```bash
$ env DECK_DATA=$HOME/Documents/work/KB/repos/tangledtrees npm run dev
```

## Deployment
```bash
$ npm run build
```

### Nginx Config Example
```
server {
    location /graphdeck {
        root /srv/static/;
        try_files $uri $uri/ $uri.html /graphdeck/index.html;
    }
}
```
