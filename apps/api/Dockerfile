FROM node:24-bookworm-slim

WORKDIR /app

RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*

COPY . .

RUN yarn install --immutable
RUN yarn workspace api prisma:generate
RUN yarn workspace api build
RUN sed -i 's/\r$//' /app/scripts/docker/api-entrypoint.sh \
  && chmod +x /app/scripts/docker/api-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

CMD ["/app/scripts/docker/api-entrypoint.sh"]
