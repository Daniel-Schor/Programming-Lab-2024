# Programming-Lab-2024

## Setup
- Download and install [NODE](https://nodejs.org/en/download)
- Clone the Repository to your local machine

## How to code:
- **autocompiler:** F1 -> Tasks: Run Build Task -> tsc: watch - tsconfig.json (only compiles if no errors)
- if compiling error occurs in frontend: F1 -> Tasks: Run Build Task -> tsc: watch - src/frontend/tsconfig.json 
- if compiling error occurs in backend: F1 -> Tasks: Run Build Task -> tsc: watch - src/frontend/tsconfig.json 
- **auto restart code:** npx nodemon dist/backend/index.js (copy paste in console)

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

# PostgresSQL

## Download and instal PostgresSQL
https://www.postgresql.org/download/

Click on until you reach the password input.
You will choose your own password.
Then click on until you reach the "Locale" setting. There you select "English, United States".
Then click further.

## Load Database
download database file : https://mega.nz/file/tN8GzaCZ#K1GlpgOKlsHDx8J_3XowRR2DTZFKJOXlJXFbXKXp3Yo
- open pgAdmin4
- create a database named "pizza"
- right click on pizza and choose "restore"
- now choose the downloaded file through the explorer 


# Links
## Document folder
https://studfrauasde-my.sharepoint.com/:f:/r/personal/yannis_koerner_stud_fra-uas_de/Documents/Programming-Lab?csf=1&web=1&e=vDj29A

## Analze Data
https://studfrauasde-my.sharepoint.com/:w:/g/personal/tristan_buls_stud_fra-uas_de/EZX1jaI2qFdCojF1y3b-osABBWreVkqK7syMf01LEtO0Bw?e=Nwg9YH

## Sprint Log
https://studfrauasde-my.sharepoint.com/:x:/g/personal/fatima_irhzal_stud_fra-uas_de/Ec4mQB_Eqk9HnrkcP1y7kb4BTfjSLtL8Pj2u6e094IZEqQ?e=VrTUaS
