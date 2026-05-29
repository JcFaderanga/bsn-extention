export function getEnv() {
    let env = localStorage.getItem('env');

    if (!env) {
        env = 'qa';
    }

    return env.toLowerCase();
}