const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();
const bigTodoParseRegex = /\/\/\sTODO\s([^;]+?);\s?([^;]+?);\s*(.+)/;

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

function getUserToDo(todos, name) {
    return todos
        .filter(todo => todo
            .toLowerCase()
            .indexOf(name.toLowerCase()) !== -1
        );
}

function getSortedToDo(todos, sortKey) {
    switch (sortKey) {
        case 'importance':
            let todosWithKeys = new Map();
            for (const todo of todos) {
                const exMarkCount = todo.split('!').length - 1;
                if (!todosWithKeys.has(exMarkCount)) {
                    todosWithKeys.set(exMarkCount, []);
                }
                todosWithKeys.get(exMarkCount).push(todo);
            }
            return [...todosWithKeys]
                .sort((a, b) => b[0] - a[0])
                .map(([, value]) => value)
        case 'user':
            const map = new Map();
            for (const todo of todos) {
                const match = todo.match(bigTodoParseRegex);
                const name = match ? match[1] : '';
                if (!map.has(name)) {
                    map.set(name, []);
                }
                map.get(name).push(todo);
            }
            return map;
        default:
            return [];
    }
}

function processCommand(command) {
    if (command.trim().startsWith('user')) {
        const todos = getUserToDo(getAllToDo(), command.split(' ')[1].toLowerCase());
        console.log(todos);
    } else if (command.trim().startsWith('sort')) {
        const todos = getSortedToDo(getAllToDo(), command.split(' ')[1]);
        console.log(todos);
    } else switch (command) {
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
