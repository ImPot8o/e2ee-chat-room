## **About**
Simple E2EE chat room I made. the subdirectory you put (chat.pot8o.dev/subdirectory) will dynamically generate a new chat room. If you and a person in the chat room have the same encryption key you will be able to see each other's messages. Usernames are stored in cookies and are mostly persistant.

## **Run locally**

install dependencies however you do that

in client run ```npm run build```

in server run ```node server.js```

or just run the next two commands in the root of the project

## **Run in online cloud environment**

root directory: leave blank

Build Command: ```npm install && npm --prefix client install && npm --prefix client run build```

Start Command: ```node server/server.js```

## **Might add**
- Persistent chats
