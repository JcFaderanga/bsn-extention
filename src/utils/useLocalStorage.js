export function getLocalStorage(key, format = true){
    const value = localStorage.getItem(key);

    if (!value || value === 'undefined') {
        return null;
    }

    try {
        return format ? JSON.parse(value) : value;
    } catch {
        return null;
    }
}

export function setLocalStorage(key, data, format = true){

    const value = format ? JSON.stringify(data) : data;
    localStorage.setItem(key, value);
}