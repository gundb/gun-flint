#! /usr/bin/env node
const parseArgs = require('minimist');
const argv = parseArgs(process.argv);
const path = require('path');
const fs = require('fs');

// First argument is node
// Absolute path to flint command
const absPath = __filename.replace(/\/flint\.js$/, '');

// 2nd argument is the command to run
const command = argv._[2];


// Retrieve commands and catch errors
function getCommand(commandName) {
    try {
        let CommandClass = require(path.join(absPath, '/commands', commandName + ".js"));
        return CommandClass;
    } catch (e) {
        console.error(`Unable to find flint command '${commandName}'. Run 'flint list' to see all available commands. Aborting...`, e);
        process.exit();
    }
}


// No command given, list all available commands
if (!command || command === 'list') {
    fs.readdir(path.join(absPath, '/commands'), (err, filePaths) => {
        if (err || !filePaths) {
            throw "Unable to locate Flint CLI commands. Please try re-installing.";
        }

        let desc = [
            "Available flint commands:\n\n",
            "list: List all available commands\n"
        ];
        filePaths.forEach(fileName => {
            let CommandClass = require(path.join(absPath, 'commands', fileName));
            desc.push(CommandClass.describe() + "\n");
        });
        console.log(desc.join(""));
        process.exit();
    });

// Retrieve help for command
} else if (command && (argv.help === true || argv.h === true)) {
    console.log(getCommand(command).help());

// Otherwise attempt to run the command with the given arguments
} else {
    let CommandClass = getCommand(command)
    let cliCommand = new CommandClass(argv);
    cliCommand.run()
        .then(() => {
            process.exit();
        })
        .catch(e => {
            console.error(e);
            console.error(`ERR!! Received error running 'flint ${command}'.`);
            process.exit();
        });
}

