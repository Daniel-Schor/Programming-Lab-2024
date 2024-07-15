# Programming-Lab-2024

## Setup
- Download and install [NODE](https://nodejs.org/en/download)
- Download and instal [PostgresSQL](https://www.postgresql.org/download/)
    - Choose the password: admin
    - Choose Locale setting: English, United States
- Configuration of PostgressSQL
    - Start pgAdmin4
    - Click File -> Preferences > Paths -> -> Binary Path -> PostgreSQL Binary Path -> choose PostgreSQL 16 and edit the binary Path to "C:\Program Files\PostgreSQL\16\bin" or there where your install file of PostgressSQL is
- Download the [Database](https://studfrauasde-my.sharepoint.com/:u:/g/personal/yannis_koerner_stud_fra-uas_de/EZvGVpPy49pIoH4PIbFGx2ABaNo38A277FUR4gqsklbdQA?e=dA7DX2)
    - start pgAdmin4
    - Click on servers -> Click on postgresSQL -> Type your Password here: admin -> Click right on databases -> create database
        - Database Name: pizza
        - owner: postgres
    - Click right on the new database -> Click on restore
        - Role Name: postgres
- Clone the Repository to your local machine

## How to code:
- **autocompiler:** F1 -> Tasks: Run Build Task -> tsc: watch - tsconfig.json (only compiles if no errors)
- if compiling error occurs in frontend: F1 -> Tasks: Run Build Task -> tsc: watch - src/frontend/public/tsconfig.json 
- if compiling error occurs in backend: F1 -> Tasks: Run Build Task -> tsc: watch - src/backend/tsconfig.json 
- **auto restart code:** npx nodemon dist/backend/index.js (copy paste in console)
```
📂 src
┣ 📂 backend
┃ ┗ 📂 Helpers : Helper functions
┃ ┗ 📂 Queries : SQL Queries
┃ ┃ ┣ 📜 Franchise.ts
┃ ┃ ┗ 📜 Store.ts
┃ ┗ 📂 Routes
┃ ┃ ┗ 📂 API : Endpoints
┃ ┃ ┃ ┣ 📜 Franchise.ts
┃ ┃ ┃ ┗ 📜 Store.ts
┣ 📂 frontend
┃ ┗ 📂 public : Charts and frontend logic
┃ ┗ 📂 views : Html pages
```
## Error fixes
```
Der Befehl ""node"" ist entweder falsch geschrieben oder
konnte nicht gefunden werden.
```
Solution:
Download and install NODE
https://nodejs.org/en/download

```
npm ERR! code ENOENT
npm ERR! syscall lstat
npm ERR! path C:\Users\User\AppData\Roaming\npm
npm ERR! errno -4058
npm ERR! enoent ENOENT: no such file or directory, lstat 'C:\Users\User\AppData\Roaming\npm'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent
```
Ordner erstellen im Path
```
npx : Die Benennung "npx" wurde nicht als Name eines Cmdlet, einer Funktion, einer Skriptdatei oder eines ausführbaren Programms erkannt. Überprüfen Sie die Schreibweise des Namens, oder ob der Pfad korrekt 
ist (sofern enthalten), und wiederholen Sie den Vorgang.
```
Sollte eigentlich nur auftreten wenn Visual Studio nicht nach dem installieren von Node neu gestartet wurde. Also neustarten!!
```
Need to install the following packages:
nodemon@3.1.0

Y drücken dann wird es installiert
```
