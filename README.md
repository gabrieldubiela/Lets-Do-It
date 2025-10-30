# Overview

Let's Do It is a to-do application that organize tasks by projects. You can try at https://letsdoit-53749423-4f69b.web.app/

To use the program need create an account and login in. First need create one or more projects. Then select the project to create the tasks. The tasks can be edit, excluded or sign as completed.

The program connects to the Google Firebase platform using API keys. When a user creates, edits, or deletes a project or task, the program sends that information to the Firestore database. The database has security rules that check if the user is logged in and ensures they can only access their own data.

The purpose of this program was to learn and practice using the java script to integrate to cloud database.

[To-do App with Cloud Database] (http://youtube.link.goes.here)

# Cloud Database

The application uses Google Cloud Firestore, which is a NoSQL, document-based database provided by the Firebase platform. This allows the app to store and sync data in real-time.

The database is structured around users to ensure data privacy. It has a top-level collection called `users`. Each document within this collection is identified by a unique `userId` after a user authenticates. Inside each user's document, there are two sub-collections:
- A `projects` collection to store the projects created by the user.
- A `tasks` collection to store the tasks associated with those projects.
This structure, enforced by security rules, guarantees that users can only read and write to their own data.

# Development Environment

The application was developed using the following tools:

- React: A JavaScript library for building user interfaces.
- Vite: A build tool that provides a faster and leaner development experience for modern web projects.
- Firebase: A platform that provides backend services, including Authentication and Firestore.
- Material-UI (MUI): A popular React UI framework for faster and easier web development.

# Useful Websites

- Firebase (https://firebase.google.com/docs/firestore/quickstart?hl=pt-br#python_4)
- React Native Firebase (https://rnfirebase.io/firestore/usage)
- Free Code Campo (https://www.freecodecamp.org/news/how-to-use-the-firebase-database-in-react/)
