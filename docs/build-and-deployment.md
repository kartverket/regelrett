# README for GitHub Actions Workflow

Dette er en beskrivelse av GitHub Actions workflow-filen som brukes for å bygge, teste og deploye prosjektet
til GCP og SKIP. Filen er konfigurert for å kjøre på visse hendelser, som push og pull request, og inneholder flere jobber som
utføres i sekvens. Her er en gjennomgang av de ulike delene av workflow-filen:

## Workflow Navn

Workflow-filen har navnet "Build and deploy". Dette navnet vises i GitHub Actions-grensesnittet og gir
en indikasjon på hva workflowen gjør.

## Triggere

Workflowen trigges av følgende hendelser:

- workflow_dispatch: Manuell utløsing av workflow.
- pull_request: Workflowen kjøres på pull requests til main-grenen, med unntak av .sikkerhet,
  compose.yaml, og README.
- push: Workflowen kjøres på push til main-grenen, med samme unntak som for pull requests.

## Tillatelser (Permissions)

Workflowen krever følgende tillatelser:

- id-token: write
- contents: write

Dette gir workflowen tillatelse til å skrive til repositoriet og håndtere innhold.

## Miljøvariabler (env)

Miljøvariabler som brukes i workflowen:

- REGION: Brukes i diverse gcp script
- REGISTRY: Settes til ghcr.io (GitHub Container Registry).
- ARGO_VERSION_FILE: Filen som inneholder versjonsinformasjon for deployering.
- IMAGE_NAME: Navnet på Docker-bildet, basert på GitHub-repositoriet.

## Jobber

### Build

Denne jobben bygger og pusher Docker-bildet for prosjektet.

Steg i jobben:
Checkout: Henter koden fra repositoriet.
Setup Java: Konfigurerer Java (Temurin JDK 21).
Setup Gradle: Konfigurerer Gradle for testing.
Run tests: kjører integrasjons og enhetstester
Set tag: Bestemmer Docker-tag basert på branch.
Login to Github Container Registry: Logger inn i GitHub Container Registry.
Docker meta: Genererer metadata for Docker-bildet.
Build docker and push: Bygger og pusher Docker-bildet.
Set output with build values: Setter output-verdier for senere jobber.

### Pharos

Pharos er en workflow fra kartverket som kjører to scannere. Den ene scanneren, som de fleste bruker, er en
image-scanner som scanner docker-imaget etter sårbarheter i pakkeavhengigheter. Den andre scanneren er en scanner som
scanner terraform-kode.

Denne jobben kjører Pharos-verktøyet fra kartverket på Docker-bildet for å sjekke sikkerheten.

Steg i jobben:
Run Pharos: Kjører Pharos på Docker-bildet som ble bygget i forrige jobb.

### Deploy to GCP
Regelrett teamet bruker GCP til å hoste sin egen instans av regelrett, ettersom vi ikke har tilgang til
instansene som kjører på SKIP.

####Steg i jobben:
Oppsett:
- Checout code
- Set repository name
- Set Docker image url: Disse stegene setter verdier som brukes senere
- Debug env variables

Deployment:
- Authenticate to google cloud
- setup google cloud sdk
- deploy to cloud run



### Deploy to Dev/prod

SKIP er hosting-plattformen til Kartverket

Denne jobben deployer prosjektet til SKIP, men kun hvis det er en push til main-grenen.

Steg i jobben:
Checkout apps-repo: Henter koden fra skvis-apps-repositoriet.
Update version: Oppdaterer versjonsfilen med den nye Docker-bilde-URL-en og pusher endringen.

## Oppsummering

Denne workflowen er designet for å automatisere bygging, testing, og deployering av prosjektet til SKIP. Den
håndterer bygging av Docker-bilde, sikkerhetssjekk med Pharos, og deployering til produksjonsmiljøet.

Workflowen sørger for at kun endringer i main-grenen som består alle trinnene, blir deployert. Eventuelle feilsteg
underveis vil forhindre at nye versjoner blir tatt i bruk.

### Kontakt

Hvis noe er oklart spør noen på teamet eller ta kontakt med:

- Lars Sørensen
