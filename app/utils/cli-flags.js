// Where all CLI flag commands are defined using yargs

module.exports = {
    // Sets the env var DEV_MODE to true with flag --dev
    devFlag() {
        const argv = require('yargs/yargs')(process.argv.slice(2))
            .usage('Usage: $0 <command> [options]')
            .command("--dev", "run in dev test mode")
            .help()
            .argv;

        if (argv.dev) {
            console.log("Dev Mode activated");
            process.env.DEV_MODE = true;
        }
    }
}