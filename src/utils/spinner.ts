import ora from 'ora';

const spinner = ora({
    spinner: {
        interval: 70,
        frames: [
            '⣾',
            '⣽',
            '⣻',
            '⢿',
            '⡿',
            '⣟',
            '⣯',
            '⣷',
        ],
    },
});

export default spinner;
