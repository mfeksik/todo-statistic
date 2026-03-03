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

function getAfterDateToDo(command) {
    const startDate = new Date(command.trim().slice(5))
    const todosAfterDate = []
    for (const line of getAllToDo()) {
        const match = line.match(bigTodoParseRegex);
        if (!match) {
            continue;
        }
        if (new Date(match[2]) > startDate) {
            todosAfterDate.push(match[0]);
        }
    }
    return todosAfterDate;
}

function processCommand(command) {
    let resultString;

    if (command.trim().startsWith('date ')) {
        resultString = getAfterDateToDo(command);
    } else if (command.trim().startsWith('user')) {
        resultString = getUserToDo(getAllToDo(), command.split(' ')[1].toLowerCase());
    } else if (command.trim().startsWith('sort')) {
        resultString = getSortedToDo(getAllToDo(), command.split(' ')[1]);
    } else switch (command) {
        case 'show':
            resultString = getAllToDo();
            break;
        case 'important':
            resultString = getAllToDo().filter(line => line.includes('!'));
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            resultString = 'wrong command';
    }

    console.log(resultString);
}

// TODO you can do it!
