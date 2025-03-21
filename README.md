# Kartverket - Regelrett

Velkommen til Regelrett!

Denne applikasjonen er bygget for visning av data i tabellformat på en oversiktlig og brukervennlig måte. Løsningen støtter for øyeblikket
data fra AirTable og YAML-filer. Den er utviklet med fokus på å hjelpe brukere med å oppfylle krav og standarder ved å gi
en strukturert oversikt over nødvendige data. Brukere kan legge inn svar i ulike formater samt legge til kommentarer
direkte i tabellens rader, noe som gjør det enkelt å holde oversikt over status og nødvendig informasjon. Løsningen er
fleksibel og tilrettelagt for videre utvidelser etter behov.

Følg stegene nedenfor for å komme i gang, og bruk de tilgjengelige skriptene for å administrere prosjektet effektivt.

## Sette opp database lokalt
### Steg 1
Start med å klone repoet fra GitHub:

`git clone <repository-url>`

### Steg 2
For å sette opp databasen må man ha installert Docker. Dette kan du gjøre ved å kjøre denne kommandoen:

`brew cask install docker`

### Steg 3
Du trenger også et verktøy for håndtering av containere eller et container-runtime miljø som lar deg kjøre containere på din lokale maskin.
Du kan bruker docker desktop dersom du har det. Hvis ikke kan du bruke Colima. Last ned Colima ved å kjøre denne kommandoen:

`brew install colima`.

### Steg 4
Etter å ha installert Colima, kan du starte det opp ved å kjøre denne kommandoen:

`colima start --network-address`

### Steg 5
Når du har Colima eller Docker Desktop kjørende, kjør denne kommandoen:

`docker run --name regelrett-db -it -e POSTGRES_PASSWORD=pwd -e POSTGRES_USER=postgres -e POSTGRES_DB=regelrett -p 5432:5432 -d postgres:15.4`

Nå skal databasen være oppe og kjøre!

### Steg 6
Kjør denne kommandoen i `backend/` for å migrere databaseskjemaer som ligger i `resources/db.migration`:

`./gradlew flywayMigrate`

NB: Forutsetter at du har satt miljøvariablene DB_URL, DB_NAME og DB_PASSWORD.

Eventuelt, om du har flyway cli innstallert:
`flyway -user=postgres -password=pwd -url=jdbc:postgresql://localhost:5432/regelrett -locations=src/main/resources migrate`

### Info
- Filen curl.txt inneholder curl kommandoer for å utføre spørringer mot Airtable
- Applikasjonen bruker en PostgresQl Database, og Flyway migration for å gjøre endringer på databaseskjemaer.
- Alle filer i Flyway migration script må ha følgende format:

`<Version>__<Description>.sql` For eksempel: `V1.1__initial.sql`

- Databasen heter "regelrett", og må foreløpig settes opp lokalt på utviklerens maskin utenfor Flyway.
- Databasemigreringer kjører automatisk ved oppstart av applikasjonen, eller så kan de kjøres manuelt med `./gradlew flywayMigrate`


## Kjøre backend lokalt

### Steg 1
- Gå inn på `Run -> Edit configurations`
- Trykk på + for å legge til ny konfigurasjon og velg KTOR
- Sett `no.bekk.ApplicationKt` som main class

### Steg 2
Du trenger å sette følgende miljøvariabler:
```
AIRTABLE_ACCESS_TOKEN
CLIENT_ID
CLIENT_SECRET
TENANT_ID
```
For å få tilgang til hemmelighetene, spør noen på teamet om å gi deg tilgang til 1Password vaulten.

`AIRTABLE_ACCESS_TOKEN` er lagret under `AirTable` i vaulten, og `CLIENT_ID`, `CLIENT_SECRET`
og `TENANT_ID` er lagret under `EntraId`.

Du kan sette miljøvariablene i IntelliJ ved å gå inn på `Run -> Edit configurations`.

### Steg 3
Du skal nå kunne kjøre backend, gå inn på http://localhost:8080

### Mer dokumentasjon
For mer dokumentasjon om [build and deployment](./docs/build-and-deployment.md), [kodestruktur](./docs/code-structure.md) og
[datamodell](./docs/data-model.md) se /docs mappen.

## Kjøre testene

For å kunne kjøre flere av testene lokalt, så må du ha en fungerende dockerinstallasjon.
I tillegg, avhengig av oppsettet ditt, så er det noen spesifikke miljøvariabler som må settes.
Hvis du bruker colima, sett følgende i .bashrc/.zshrc eller andre tilsvarende konfigurasjonsfiler for ditt shell;
```shell
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
export TESTCONTAINERS_HOST_OVERRIDE=$(colima ls -j | jq -r '.address')
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
```

Merk at det er viktig at colima startes med `--network-address` flagget, da det er trengs for å hente ut adressen til `TESTCONTAINERS_HOST_OVERRIDE`.

Hvis du bruker noe annet, eksempelvis Podman eller Rancher, se dokumentasjonen til testcontainers;
https://java.testcontainers.org/supported_docker_environment/

## Kjøre frontend lokalt
Frontend er bygget med React, Vite og TypeScript.

### Steg 1
Før du begynner, sørg for at du har følgende installert:

- **[Node.js](https://nodejs.org)** (versjon 14.x eller nyere)
- **[npm](https://www.npmjs.com/get-npm)**

### Steg 2
Gå inn i frontend mappen:

`cd <repository-directory>/frontend/beCompliant`

### Steg 3
Installer avhengigheter ved å kjøre:

`npm install`

### Steg 4
Forbered Husky (hvis aktuelt) ved å kjøre:

`npm run prepare`

### Steg 5
Start utviklingsserveren ved å kjøre:

`npm run dev`

Dette vil starte Vite utviklingsserveren, og du kan se appen på http://localhost:3000.

### Mer informasjon
- For å sikre kodekvalitet, kjør lint-verktøyet: `npm run lint`
- For å automatisk fikse lintingproblemer: `npm run lint-fix`
- For å formatere kodebasen med Prettier: `npm run format`. Dette vil formatere alle filer i src-mappen
- For å lage en produksjonsklar versjon av prosjektet: `npm run build`. Dette vil kompilere TypeScript-filene og
pakke applikasjonen ved hjelp av Vite. Output vil bli plassert i dist-mappen, klar for utrulling.
- Før du ruller ut, kan du forhåndsvise produksjonsbygget lokalt: `npm run preview`. Denne kommandoen vil servere
produksjonsbygget på en lokal server, slik at du kan verifisere at alt fungerer som forventet.
- Husky er konfigurert til å kjøre visse skript før commits blir fullført. Dette inkluderer linting og TypeScript-sjekker
for å sikre kodekvalitet og konsistens. For å manuelt utløse disse sjekkene, kan du kjøre: `npm run pre-commit`.
Dette vil kjøre lint-staged for å sjekke de stage’ede filene og sikre at TypeScript-filene er feilfrie før de blir
committet.
- Dette prosjektet bruker TanStack Query (tidligere kjent som React Query) for å håndtere nettverksforespørsler og
servertilstand. TanStack Query forenkler datainnhenting, caching, synkronisering og oppdatering av servertilstand i
React-applikasjoner. Ved å bruke dette kraftige biblioteket sikrer prosjektet effektiv og pålitelig datahåndtering,
minimerer unødvendige nettverksforespørsler, og gir en optimal brukeropplevelse med automatiske bakgrunnsoppdateringer
og feilhåndtering. Se dokumentasjonen for Tanstack Query her https://tanstack.com/query/latest
- For mer dokumentasjon om [Build and deployment](./docs/build-and-deployment.md)
