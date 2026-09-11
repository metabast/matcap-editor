FROM node:22-alpine

# The `node` user is uid/gid 1000, matching the host user, so files written
# to the bind-mounted workdir (dist/, package-lock.json, vite cache) stay
# owned by them.
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
# --legacy-peer-deps: prettier-eslint and @vue/eslint-config-typescript declare
# conflicting eslint peer ranges; npm's strict resolver cannot satisfy both.
RUN npm ci --legacy-peer-deps

COPY --chown=node:node . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
