const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function getAllToDo() {
    const result = [];
    for (const file of files) {
        const lines = file
            .split('\n')
            .filter(line => line.includes('// TODO '))
            .map(line => line
                .slice(line.indexOf('// TODO '))
                .trim());
        result.push(...lines);
    }
    return result;
}

function processCommand(command) {
    switch (command) {
        case 'show':
            const todos = getAllToDo();
            console.log(todos); // здесь можно будет здесь норм красивый вывод
            break;
        case 'important':
            const todosWithExclamation = getAllToDo().filter(line => line.includes('!'));
            console.log(todosWithExclamation);
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
