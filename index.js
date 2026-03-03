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

function getExMarkCount(string) {
    return string.split('!').length - 1;
}

function getAllToDo() {
    const match = `${'//'} ${'TODO'} `
    const result = [];
    for (const file of files) {
        const lines = file
            .split('\n')
            .filter(line => line.includes(match))
            .map(line => line
                .slice(line.indexOf(match))
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
                const exMarkCount = getExMarkCount(todo);
                if (!todosWithKeys.has(exMarkCount)) {
                    todosWithKeys.set(exMarkCount, []);
                }
                todosWithKeys.get(exMarkCount).push(todo);
            }
            return [...todosWithKeys]
                .sort((a, b) => b[0] - a[0])
                .flatMap(([, value]) => value);
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
            return [...map.entries()]
                .sort((a, b) => -a[0].localeCompare(b[0]))
                .flatMap(([, value]) => value);
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
            console.log('wrong command');
            return;
    }

    for (const todo of resultString) {
        const hasExMark = getExMarkCount(todo) > 0;
        const parts = todo.match(bigTodoParseRegex);
        let [userName, date, text] = parts ? parts.slice(1) : ['', '', ''];
        if (!parts) {
            text = todo.slice(8);
        }

        let resultArray = [];
        resultArray.push(hasExMark ? '!' : ' ');
        resultArray.push('  |  ');
        if (userName.length > 10) {
            userName = `${userName.substring(0, 7)}...`;
        }
        if (text.length > 50) {
            text = `${text.substring(0, 47)}...`;
        }
        resultArray.push(userName.padEnd(10));
        resultArray.push('  |  ');
        resultArray.push(date.padEnd(10));
        resultArray.push('  |  ');
        resultArray.push(text.padEnd(50));

        console.log(resultArray.join(''));
    }
}

// TODO you can do it!
