# Programming-Lab-2024

## Setup
### Requirments
Node.js, PostgresSQL Version 16, SQL Database File

### Dependencies
1.	Download and install [NODE](https://nodejs.org/en/download)
### PostgresSQL
2.	Download and install [PostgresSQL Version 16](https://www.postgresql.org/download/)
    - Choose the password: admin
    - Choose your own Port or choose the default Port: 5432
3.	Configuration of PostgresSQL
    - Start pgAdmin4
    - Click File => Preferences => Paths => Binary Path => PostgreSQL Binary Path => choose PostgreSQL 16 and edit the binary Path to "C:\Program Files\PostgreSQL\16\bin"
    - If default Port was changed
        - Click Servers => Right Click on PostgresSQL => choose Properties => choose connection -> change the port number to your port
### Database
4.	Download the [Database](https://studfrauasde-my.sharepoint.com/:u:/g/personal/yannis_koerner_stud_fra-uas_de/EZvGVpPy49pIoH4PIbFGx2ABaNo38A277FUR4gqsklbdQA?e=dA7DX2)
    - start pgAdmin4
    - Click on servers => Click on PostgresSQL => Type your Password here: admin => Right click on databases => create database
        - Database Name: pizza
        - owner: postgres
    - Right Click on the new database pizza => Click on restore
        - Role Name: postgres
### Project
5.	Clone the Repository to your local machine from GitHub or download a zip of the whole repository from here
6.	Open your terminal or command prompt
    - Navigate to the directory of the repository
    - Type “node dist/backend/index.js”
    - Open the link in the terminal
 
### Changing Port of the Dashboard
1.	Navigate to the directory of the repository
2.	Open the file “.env”
3.	Change the value: WEB_PORT = 3000

### Changing Port of the PostgresSQL Server
1.	Navigate to the directory: C:\Program Files\PostgreSQL\16\data
2.	Open the file: postgresql.conf
    - Change the value: port = 5432
3.	Restart PostgresSQL Service
    - Open the Terminal with Admin right
        - net stop postgresql-x64-16
        - net start postgresql-x64-16
4.	Navigate to the repository
5.	Open the file “.env”
    - Change the value: DB_PORT: 5432

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
┃ ┗ 📜 *index.ts*
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
