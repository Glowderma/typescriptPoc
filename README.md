# typescriptPoc
Before you begin, ensure you have the following installed:

Node.js: Download and install Node.js from nodejs.org.

npm: This comes with Node.js. Verify the installation by running npm -v in your terminal.

TypeScript: Install TypeScript globally by running the following command:
npm install -g typescript

1) Create a New Project Directory
2) Initialize the Project
3) Install TypeScript Locally
    npm install typescript --save-dev
4) Set Up a TypeScript Configuration File
    npx tsc --init  
    This creates a tsconfig.json file with default configurations. You can customize it later as needed.

5) Compile TypeScript to JavaScript
    npx tsc

6) Run the Program   
    node index.js


Updating ts config file :

{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noImplicitAny": false,
    "moduleResolution": "node"
    "allowSyntheticDefaultImports": true, 
     "outDir": "./",*
     "rootDir": "."
  },
  "include": ["*.ts"],
  "exclude": ["node_modules","dist"]
}




