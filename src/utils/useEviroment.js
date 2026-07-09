import { getLocalStorage } from "./useLocalStorage";
export default function env() {
    let env = getLocalStorage('env', false);
    let activeTab = getLocalStorage('lastTab', false);

    if (!env) {
        env = 'qa';
    }

    return env.toLowerCase();
}