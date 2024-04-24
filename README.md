# Programming-Lab-2024

Download and install NODE
https://nodejs.org/en/download

# How to code:
start autocompiler: F1 -> Tasks: Run Build Task -> tsc: watch
start server (auto restart after edit): npx nodemon dist/index.js (copy paste in console)


# Error fixes
Der Befehl ""node"" ist entweder falsch geschrieben oder
konnte nicht gefunden werden.

Solution:
Download and install NODE
https://nodejs.org/en/download


npm ERR! code ENOENT
npm ERR! syscall lstat
npm ERR! path C:\Users\User\AppData\Roaming\npm
npm ERR! errno -4058
npm ERR! enoent ENOENT: no such file or directory, lstat 'C:\Users\User\AppData\Roaming\npm'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent

Ordner erstellen im Path

npx : Die Benennung "npx" wurde nicht als Name eines Cmdlet, einer Funktion, einer Skriptdatei oder eines ausführbaren Programms erkannt. Überprüfen Sie die Schreibweise des Namens, oder ob der Pfad korrekt 
ist (sofern enthalten), und wiederholen Sie den Vorgang.

Sollte eigentlich nur auftreten wenn Visual Studio nicht nach dem installieren von Node neu gestartet wurde. Also neustarten!!

Need to install the following packages:
nodemon@3.1.0

Y drücken dann wird es installiert

# PostgresSQL

## Download and instal PostgresSQL
https://www.postgresql.org/download/

Click on until you reach the password input.
You will choose your own password.
Then click on until you reach the "Locale" setting. There you select "English, United States".
Then click further.