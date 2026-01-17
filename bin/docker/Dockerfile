FROM caddy:2.10.0-builder-alpine AS builder

RUN xcaddy build \
	--with github.com/caddyserver/jsonc-adapter

FROM caddy:2.10.0-alpine

ENV CYUSER=caddy
ENV CYCONFIG=/etc/caddy
ENV CYROOT=/usr/share/caddy

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

COPY Caddyfile.jsonc $CYCONFIG

RUN rm $CYROOT/index.html

# Unprivileged user
RUN	addgroup -S $CYUSER
RUN adduser -S -G $CYUSER -h $CYROOT $CYUSER

RUN chown -R $CYUSER:$CYUSER $XDG_CONFIG_HOME $XDG_DATA_HOME $CYROOT

USER $CYUSER

CMD ["sh", "-c", \
	"caddy run --config $CYCONFIG/Caddyfile.jsonc --adapter jsonc" \
]